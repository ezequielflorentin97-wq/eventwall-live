'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { configureEvent } from '../../actions'
import { PRESET_NAMES, PRESETS } from '../../../../lib/presets'
import { FONT_PAIRS, findFontPair, type FontPairId } from '../../../../lib/fontPairs'
import { TEXT_EFFECTS, type TextEffectId } from '../../../../lib/textEffects'
import { normalizeHexColor } from '../../../../lib/colorUtils'
import { toStorage, toEditable } from '../../../../lib/lineBreaks'
import { EventPreview } from '../../../../components/admin/EventPreview'
import { LogoUploader } from '../../../../components/admin/LogoUploader'
import type { Preset } from '../../../../lib/config'

type ColorKey = keyof Preset['colors']
const COLOR_LABELS: Record<ColorKey, string> = {
  bg: 'Fondo',
  primary: 'Primario (títulos, botones)',
  dark: 'Secundario / oscuro',
  text: 'Texto',
  uploadBg: 'Fondo de la vista "Subir foto"',
}

function toEditableTexts(texts: Preset['texts']) {
  return {
    homeTitle: toEditable(texts.homeTitle),
    qrSubtitle: toEditable(texts.qrSubtitle),
    uploadTitle: toEditable(texts.uploadTitle),
    footerText: toEditable(texts.footerText),
  }
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const [text, setText] = useState(value)

  function commit(raw: string) {
    const normalized = normalizeHexColor(raw, value)
    setText(normalized)
    onChange(normalized)
  }

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
      {label}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => {
            setText(e.target.value)
            onChange(e.target.value)
          }}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          placeholder="#F0C230"
          style={{ width: 100, fontFamily: 'monospace' }}
        />
      </div>
    </label>
  )
}

export default function Wizard() {
  const params = useParams<{ eventId: string }>()
  const router = useRouter()

  const [presetId, setPresetId] = useState(PRESET_NAMES[0])
  const [eventName, setEventName] = useState('')
  const [colors, setColors] = useState(PRESETS[PRESET_NAMES[0]].colors)
  const [fontPairId, setFontPairId] = useState<FontPairId>(FONT_PAIRS[0].id)
  const [texts, setTexts] = useState(toEditableTexts(PRESETS[PRESET_NAMES[0]].texts))
  const [qrColor, setQrColor] = useState(PRESETS[PRESET_NAMES[0]].colors.primary)
  const [qrColorTouched, setQrColorTouched] = useState(false)
  const [titleEffect, setTitleEffect] = useState<TextEffectId>('ninguno')
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fontPair = findFontPair(fontPairId)

  function applyPreset(id: string) {
    setPresetId(id)
    const preset = PRESETS[id]
    setColors(preset.colors)
    setTexts(toEditableTexts(preset.texts))
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
        eventName: toStorage(eventName),
        colors,
        fonts: { display: fontPair.display, body: fontPair.body },
        texts: {
          homeTitle: toStorage(texts.homeTitle),
          qrSubtitle: toStorage(texts.qrSubtitle),
          uploadTitle: toStorage(texts.uploadTitle),
          footerText: toStorage(texts.footerText),
        },
        qrColor,
        titleEffect,
        logoUrl,
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
            Nombre del evento (podés usar Enter para un salto de línea)
            <textarea
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              rows={2}
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

          <label>
            Efecto del título
            <select value={titleEffect} onChange={(e) => setTitleEffect(e.target.value as TextEffectId)} style={{ display: 'block', width: '100%' }}>
              {TEXT_EFFECTS.map((fx) => (
                <option key={fx.id} value={fx.id}>
                  {fx.label}
                </option>
              ))}
            </select>
          </label>

          <LogoUploader value={logoUrl} onChange={setLogoUrl} />

          <fieldset style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <legend>Colores</legend>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 0 }}>
              Elegí el color con la paleta, o escribí el código si ya lo tenés (si te equivocás, se corrige solo).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.8rem' }}>
              {(Object.keys(COLOR_LABELS) as ColorKey[]).map((key) => (
                <ColorField key={key} label={COLOR_LABELS[key]} value={colors[key]} onChange={(v) => updateColor(key, v)} />
              ))}
            </div>
          </fieldset>

          <ColorField
            label="Color del QR"
            value={qrColor}
            onChange={(v) => {
              setQrColor(v)
              setQrColorTouched(true)
            }}
          />

          <fieldset style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <legend>Textos</legend>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 0 }}>Enter hace un salto de línea normal.</p>
            <label style={{ display: 'block', marginBottom: '0.6rem' }}>
              Subtítulo del QR
              <textarea
                value={texts.qrSubtitle}
                onChange={(e) => setTexts((t) => ({ ...t, qrSubtitle: e.target.value }))}
                rows={2}
                style={{ display: 'block', width: '100%' }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '0.6rem' }}>
              Título de &quot;Subir foto&quot;
              <textarea
                value={texts.uploadTitle}
                onChange={(e) => setTexts((t) => ({ ...t, uploadTitle: e.target.value }))}
                rows={2}
                style={{ display: 'block', width: '100%' }}
              />
            </label>
            <label style={{ display: 'block' }}>
              Texto del pie en pantalla
              <textarea
                value={texts.footerText}
                onChange={(e) => setTexts((t) => ({ ...t, footerText: e.target.value }))}
                rows={2}
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
            titleEffect={titleEffect}
            logoUrl={logoUrl}
          />
        </div>
      </div>
    </main>
  )
}
