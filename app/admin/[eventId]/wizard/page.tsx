'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { configureEvent } from '../../actions'
import { PRESET_NAMES } from '../../../../lib/presets'

export default function Wizard() {
  const params = useParams<{ eventId: string }>()
  const [preset, setPreset] = useState(PRESET_NAMES[0])
  const [eventName, setEventName] = useState('')
  const [footerText, setFooterText] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { slug } = await configureEvent(params.eventId, {
        preset,
        eventName,
        texts: footerText ? { homeTitle: eventName, qrSubtitle: '', uploadTitle: '', footerText } : undefined,
      })
      router.push(`/admin?configured=${slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al configurar el evento')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '3rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Configurar evento</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <label>
          Preset
          <select value={preset} onChange={(e) => setPreset(e.target.value)} style={{ display: 'block', width: '100%' }}>
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
          Texto del pie (opcional)
          <input
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Generando…' : 'Generar evento'}
        </button>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </form>
    </main>
  )
}
