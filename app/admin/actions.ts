'use server'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { isLocalMode } from '../../lib/localMode'
import { listSlugs as listLocalSlugs, updateEvent as updateLocalEvent } from '../../lib/db/localStore'
import { mergeEventConfig, type Preset } from '../../lib/config'
import { slugify, withSuffixIfTaken } from '../../lib/slug'
import { computeExpiresAt } from '../../lib/retention'
import { PRESETS } from '../../lib/presets'

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

  const existingSlugs = isLocalMode() ? await listLocalSlugs() : await listSupabaseSlugs()

  const baseSlug = slugify(input.eventName)
  const slug = withSuffixIfTaken(baseSlug, existingSlugs)
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

  const configuredAt = new Date().toISOString()
  const expiresAt = computeExpiresAt(configuredAt)

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

async function listSupabaseSlugs(): Promise<string[]> {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.from('events').select('slug')
  return (data ?? []).map((e) => e.slug).filter((v): v is string => Boolean(v))
}
