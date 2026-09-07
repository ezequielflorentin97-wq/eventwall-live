import Link from 'next/link'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { isLocalMode } from '../../lib/localMode'
import { listEvents as listLocalEvents, type EventRow } from '../../lib/db/localStore'

async function loadEvents(): Promise<EventRow[]> {
  if (isLocalMode()) {
    return listLocalEvents()
  }
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
  return (data ?? []) as EventRow[]
}

export default async function AdminEventList() {
  const events = await loadEvents()

  return (
    <main style={{ maxWidth: 720, margin: '3rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Eventos</h1>
      {isLocalMode() && <p style={{ fontSize: '0.8rem', color: '#888' }}>Modo local (QA) — datos en local-data/events.json.</p>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {events.map((ev) => (
          <li key={ev.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.8rem 1rem' }}>
            <strong>{ev.customer_name ?? ev.customer_email ?? ev.id}</strong> — {ev.tier} — {ev.status}
            {ev.status === 'pagado_sin_configurar' && (
              <>
                {' '}
                <Link href={`/admin/${ev.id}/wizard`}>Configurar</Link>
              </>
            )}
            {ev.status === 'activo' && (
              <span>
                {' '}
                — <Link href={`/e/${ev.slug}`}>/e/{ev.slug}</Link> · para el cliente:{' '}
                <Link href={`/e/${ev.slug}/descargar`}>/e/{ev.slug}/descargar</Link>
                {ev.expires_at && <> (vence {new Date(ev.expires_at).toLocaleDateString('es-AR')})</>}
              </span>
            )}
          </li>
        ))}
        {events.length === 0 && <p>Todavía no hay eventos pagados.</p>}
      </ul>
    </main>
  )
}
