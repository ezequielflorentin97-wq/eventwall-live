import { notFound } from 'next/navigation'
import { getSupabaseServerClient } from '../../../../lib/supabaseServer'
import { isLocalMode } from '../../../../lib/localMode'
import { listEvents as listLocalEvents } from '../../../../lib/db/localStore'
import { fetchEventAnalytics } from '../../../../lib/analytics'
import type { EventConfig } from '../../../../lib/config'

export default async function EventAnalyticsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params

  const event = isLocalMode() ? await findLocalEvent(eventId) : await findSupabaseEvent(eventId)
  if (!event || !event.config) notFound()

  const config = event.config as EventConfig
  const stats = await fetchEventAnalytics(config.cloudinaryFolder)
  const maxDay = Math.max(1, ...stats.uploadsByDay.map((d) => d.count))

  return (
    <main style={{ maxWidth: 720, margin: '3rem auto', fontFamily: 'system-ui, sans-serif', padding: '0 1.5rem' }}>
      <h1>Estadísticas — {config.eventName.replace(/<br\s*\/?>/gi, ' ')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
        <Stat label="Fotos subidas" value={stats.totalPhotos} />
        <Stat label="Primera foto" value={stats.firstUpload ? new Date(stats.firstUpload).toLocaleString('es-AR') : '—'} small />
        <Stat label="Última foto" value={stats.lastUpload ? new Date(stats.lastUpload).toLocaleString('es-AR') : '—'} small />
      </div>

      <h2>Fotos por día</h2>
      {stats.uploadsByDay.length === 0 && <p>Todavía no hay fotos.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '2rem' }}>
        {stats.uploadsByDay.map((d) => (
          <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ width: 90, fontSize: '0.8rem' }}>{d.date}</span>
            <div style={{ background: '#4a3aff', height: 14, width: `${(d.count / maxDay) * 100}%`, borderRadius: 3 }} />
            <span style={{ fontSize: '0.8rem' }}>{d.count}</span>
          </div>
        ))}
      </div>

      <h2>Invitados que más subieron (con nombre)</h2>
      {stats.uploaders.length === 0 && <p style={{ fontSize: '0.85rem', color: '#888' }}>Nadie puso su nombre al subir todavía.</p>}
      <ol>
        {stats.uploaders.map((u) => (
          <li key={u.name}>
            {u.name} — {u.count} foto(s)
          </li>
        ))}
      </ol>
    </main>
  )
}

function Stat({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
      <div style={{ fontSize: small ? '0.9rem' : '1.6rem', fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#888' }}>{label}</div>
    </div>
  )
}

async function findLocalEvent(eventId: string) {
  const events = await listLocalEvents()
  return events.find((e) => e.id === eventId) ?? null
}

async function findSupabaseEvent(eventId: string) {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle()
  return data
}
