'use server'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { mergeEventConfig, type Preset } from '../../lib/config'
import { slugify, withSuffixIfTaken } from '../../lib/slug'
import xv from '../../presets/xv.json'
import boda from '../../presets/boda.json'
import corporativo from '../../presets/corporativo.json'
import cumpleanos from '../../presets/cumpleanos.json'

const PRESETS: Record<string, Preset> = { xv, boda, corporativo, cumpleanos }
export const PRESET_NAMES = Object.keys(PRESETS)

export async function configureEvent(
  eventId: string,
  input: {
    preset: keyof typeof PRESETS
    eventName: string
    colors?: Partial<Preset['colors']>
    fonts?: Partial<Preset['fonts']>
    texts?: Partial<Preset['texts']>
  }
) {
  if (!PRESETS[input.preset]) {
    throw new Error(`Preset desconocido: ${input.preset}`)
  }
  if (!input.eventName.trim()) {
    throw new Error('El nombre del evento no puede estar vacío')
  }

  const supabase = getSupabaseServerClient()
  const { data: existingEvents } = await supabase.from('events').select('slug')
  const existingSlugs = (existingEvents ?? []).map((e) => e.slug).filter((v): v is string => Boolean(v))

  const baseSlug = slugify(input.eventName)
  const slug = withSuffixIfTaken(baseSlug, existingSlugs)
  const cloudinaryFolder = slug

  const config = mergeEventConfig(PRESETS[input.preset], {
    eventName: input.eventName,
    cloudinaryFolder,
    colors: input.colors,
    fonts: input.fonts,
    texts: input.texts,
  })

  const { error } = await supabase
    .from('events')
    .update({ slug, config, status: 'activo', configured_at: new Date().toISOString() })
    .eq('id', eventId)

  if (error) throw new Error(`No se pudo configurar el evento: ${error.message}`)

  return { slug }
}
