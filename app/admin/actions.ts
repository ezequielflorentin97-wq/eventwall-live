'use server'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { isLocalMode } from '../../lib/localMode'
import {
  listSlugs as listLocalSlugs,
  updateEvent as updateLocalEvent,
  getEventById as getLocalEventById,
  type EventRow,
} from '../../lib/db/localStore'
import { mergeEventConfig, type EventConfig, type Preset } from '../../lib/config'
import { slugify, withSuffixIfTaken } from '../../lib/slug'
import { computeExpiresAt } from '../../lib/retention'
import { PRESETS } from '../../lib/presets'

export type WizardInitialData = {
  eventName: string
  config: EventConfig | null
}

// Loads the event's current config (if any) so the wizard can pre-fill
// instead of starting blank — used both for first-time setup (nothing to
// pre-fill) and re-editing an already-active event (client didn't like the
// first pass at the design).
export async function getEventForWizard(eventId: string): Promise<WizardInitialData> {
  const row = isLocalMode() ? await getLocalEventById(eventId) : await getSupabaseEventById(eventId)
  if (!row) throw new Error(`No se encontró el evento ${eventId}`)
  return { eventName: row.config?.eventName ?? '', config: row.config }
}

export async function configureEvent(
  eventId: string,
  input: {
    preset: keyof typeof PRESETS
    eventName: string
    colors?: Partial<Preset['colors']>
    fonts?: Partial<Preset['fonts']>
    texts?: Partial<Preset['texts']>
    qrColor?: string
    titleEffect?: string
    logoUrl?: string
  }
) {
  if (!PRESETS[input.preset]) {
    throw new Error(`Preset desconocido: ${input.preset}`)
  }
  if (!input.eventName.trim()) {
    throw new Error('El nombre del evento no puede estar vacío')
  }

  const existingRow = isLocalMode() ? await getLocalEventById(eventId) : await getSupabaseEventById(eventId)
  if (!existingRow) throw new Error(`No se encontró el evento ${eventId}`)

  // Re-editing an already-active event: keep its slug (and therefore its
  // Cloudinary folder — changing it would orphan photos already uploaded
  // and break the link shared with guests) and its original expiry date
  // (tweaking the design shouldn't reset the 30-day retention clock).
  const isReedit = existingRow.status === 'activo' && Boolean(existingRow.slug)
  const slug = isReedit ? existingRow.slug! : await allocateSlug(input.eventName)
  const cloudinaryFolder = slug

  const config = mergeEventConfig(PRESETS[input.preset], {
    eventName: input.eventName,
    cloudinaryFolder,
    colors: input.colors,
    fonts: input.fonts,
    texts: input.texts,
    qrColor: input.qrColor,
    titleEffect: input.titleEffect,
    logoUrl: input.logoUrl,
  })

  const configuredAt = existingRow.configured_at ?? new Date().toISOString()
  const expiresAt = existingRow.expires_at ?? computeExpiresAt(configuredAt)

  if (isLocalMode()) {
    const updated = await updateLocalEvent(eventId, {
      slug,
      config,
      status: 'activo',
      configured_at: configuredAt,
      expires_at: expiresAt,
    })
    if (!updated) throw new Error(`No se encontró el evento local ${eventId}`)
    return { slug }
  }

  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('events')
    .update({ slug, config, status: 'activo', configured_at: configuredAt, expires_at: expiresAt })
    .eq('id', eventId)

  if (error) throw new Error(`No se pudo configurar el evento: ${error.message}`)

  return { slug }
}

async function allocateSlug(eventName: string): Promise<string> {
  const existingSlugs = isLocalMode() ? await listLocalSlugs() : await listSupabaseSlugs()
  const baseSlug = slugify(eventName)
  return withSuffixIfTaken(baseSlug, existingSlugs)
}

async function listSupabaseSlugs(): Promise<string[]> {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.from('events').select('slug')
  return (data ?? []).map((e) => e.slug).filter((v): v is string => Boolean(v))
}

async function getSupabaseEventById(eventId: string): Promise<EventRow | null> {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle()
  return data as EventRow | null
}
