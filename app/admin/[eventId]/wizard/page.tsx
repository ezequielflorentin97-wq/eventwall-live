'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { configureEvent } from '../../actions'
import { PRESET_NAMES, PRESETS } from '../../../../lib/presets'
import { FONT_PAIRS, findFontPair, type FontPairId } from '../../../../lib/fontPairs'
import { EventPreview } from '../../../../components/admin/EventPreview'
import type { Preset } from '../../../../lib/config'

type ColorKey = keyof Preset['colors']
const COLOR_LABELS: Record<ColorKey, string> = {
  bg: 'Fondo',
  primary: 'Primario (títulos, botones)',
  dark: 'Secundario / oscuro',
  text: 'Texto',
  uploadBg: 'Fondo de la vista "Subir foto"',
}

export default function Wizard() {
  const params = useParams<{ eventId: string }>()
  const router = useRouter()

  const [presetId, setPresetId] = useState(PRESET_NAMES[0])
  const [eventName, setEventName] = useState('')
  const [colors, setColors] = useState(PRESETS[PRESET_NAMES[0]].colors)
  const [fontPairId, setFontPairId] = useState<FontPairId>(FONT_PAIRS[0].id)
  const [texts, setTexts] = useState(PRESETS[PRESET_NAMES[0]].texts)
  const [qrColor, setQrColor] = useState(PRESETS[PRESET_NAMES[0]].colors.primary)
  const [qrColorTouched, setQrColorTouched] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fontPair = findFontPair(fontPairId)

  function applyPreset(id: string) {
    setPresetId(id)
    const preset = PRESETS[id]
    setColors(preset.colors)
    setTexts(preset.texts)
    if (!qrColorTouched) setQrColor(preset.colors.primary)
  }

  function updateColor(key: ColorKey, value: string) {
    setColors((c) => ({ ...c, [key]: value }))
    if (key === 'primary' && !qrColorTouched) setQrColor(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { slug } = await configureEvent(params.eventId, {
        preset: presetId,
        eventName,
        colors,
        fonts: { display: fontPair.display, body: fontPair.body },
        texts,
        qrColor,
      })
      router.push(`/admin?configured=${slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al configurar el evento')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ maxWidth: 920, margin: '3rem auto', fontFamily: 'system-ui, sans-serif', padding: '0 1.5rem' }}>
      <h1>Configurar evento</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <label>
            Preset de partida
            <select value={presetId} onChange={(e) => applyPreset(e.target.value)} style={{ display: 'block', width: '100%' }}>
              {PRESET_NAMES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nombre del evento
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              style={{ display: 'block', width: '100%' }}
            />
          </label>

          <label>
            Tipografía
            <select value={fontPairId} onChange={(e) => setFontPairId(e.target.value as FontPairId)} style={{ display: 'block', width: '100%' }}>
              {FONT_PAIRS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <legend>Colores</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
              {(Object.keys(COLOR_LABELS) as ColorKey[]).map((key) => (
                <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
                  {COLOR_LABELS[key]}
                  <input type="color" value={colors[key]} onChange={(e) => updateColor(key, e.target.value)} />
                </label>
              ))}
            </div>
          </fieldset>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
            Color del QR
            <input
              type="color"
              value={qrColor}
              onChange={(e) => {
                setQrColor(e.target.value)
                setQrColorTouched(true)
              }}
            />
          </label>

          <fieldset style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <legend>Textos</legend>
            <label style={{ display: 'block', marginBottom: '0.6rem' }}>
              Título de inicio (usá &lt;br&gt; para salto de línea)
              <input
                value={texts.homeTitle}
                onChange={(e) => setTexts((t) => ({ ...t, homeTitle: e.target.value }))}
                style={{ display: 'block', width: '100%' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '0.6rem' }}>
              Subtítulo del QR
              <input
                value={texts.qrSubtitle}
                onChange={(e) => setTexts((t) => ({ ...t, qrSubtitle: e.target.value }))}
                style={{ display: 'block', width: '100%' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '0.6rem' }}>
              Título de &quot;Subir foto&quot;
              <input
                value={texts.uploadTitle}
                onChange={(e) => setTexts((t) => ({ ...t, uploadTitle: e.target.value }))}
                style={{ display: 'block', width: '100%' }}
              />
            </label>
            <label style={{ display: 'block' }}>
              Texto del pie en pantalla
              <input
                value={texts.footerText}
                onChange={(e) => setTexts((t) => ({ ...t, footerText: e.target.value }))}
                style={{ display: 'block', width: '100%' }}
              />
            </label>
          </fieldset>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Generando…' : 'Generar evento'}
          </button>
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
        </form>

        <div style={{ position: 'sticky', top: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.6rem' }}>Preview en vivo</p>
          <EventPreview
            eventName={eventName}
            colors={colors}
            fontDisplay={fontPair.display}
            fontBody={fontPair.body}
            qrColor={qrColor}
          />
        </div>
      </div>
    </main>
  )
}
