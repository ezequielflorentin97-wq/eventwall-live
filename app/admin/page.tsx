import Link from 'next/link'
import { getSupabaseServerClient } from '../../lib/supabaseServer'

export default async function AdminEventList() {
  const supabase = getSupabaseServerClient()
  const { data: events } = await supabase.from('events').select('*').order('created_at', { ascending: false })

  return (
    <main style={{ maxWidth: 720, margin: '3rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Eventos</h1>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {(events ?? []).map((ev) => (
          <li key={ev.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.8rem 1rem' }}>
            <strong>{ev.customer_name ?? ev.customer_email ?? ev.id}</strong> — {ev.tier} — {ev.status}
            {ev.status === 'pagado_sin_configurar' && (
              <>
                {' '}
                <Link href={`/admin/${ev.id}/wizard`}>Configurar</Link>
              </>
            )}
            {ev.status === 'activo' && <span> — /e/{ev.slug}</span>}
          </li>
        ))}
        {(events ?? []).length === 0 && <p>Todavía no hay eventos pagados.</p>}
      </ul>
    </main>
  )
}
