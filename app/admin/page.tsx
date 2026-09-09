import Link from 'next/link'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { isLocalMode } from '../../lib/localMode'
import { listEvents as listLocalEvents, type EventRow } from '../../lib/db/localStore'
import styles from '../../components/admin/AdminUI.module.css'

// Reads live event data on every request — without this, some hosting
// adapters cache the rendered HTML and a newly paid/configured event won't
// show up in the list until the cache happens to expire.
export const dynamic = 'force-dynamic'

const TIER_LABEL: Record<string, string> = { basico: 'Básico', estandar: 'Estándar', premium: 'Premium' }

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
    <main className={styles.page}>
      <div className={styles.header}>
        <h1>Eventos</h1>
        {isLocalMode() && <span className={styles.localBadge}>modo local · local-data/events.json</span>}
      </div>

      {events.length === 0 && <p className={styles.emptyState}>Todavía no hay eventos pagados.</p>}

      <div className={styles.eventList}>
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} />
        ))}
      </div>
    </main>
  )
}

function EventCard({ event: ev }: { event: EventRow }) {
  const displayName = ev.customer_name ?? ev.customer_email ?? 'Sin nombre'
  const expired = ev.status === 'vencido'

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventTop}>
        <span className={styles.eventName}>{displayName}</span>
        <span className={styles.tierChip}>{TIER_LABEL[ev.tier] ?? ev.tier}</span>
        <span
          className={
            ev.status === 'activo' ? styles.statusActive : ev.status === 'pagado_sin_configurar' ? styles.statusPending : styles.statusExpired
          }
        >
          {ev.status === 'pagado_sin_configurar' ? 'Sin configurar' : ev.status === 'activo' ? 'Activo' : 'Vencido'}
        </span>
      </div>

      <div className={styles.actions}>
        {ev.status === 'pagado_sin_configurar' && (
          <Link href={`/admin/${ev.id}/wizard`} className={styles.actionPrimary}>
            ✏️ Configurar
          </Link>
        )}

        {ev.status === 'activo' && ev.slug && (
          <>
            <Link href={`/e/${ev.slug}`} className={styles.actionPrimary}>
              ▶ Ver evento
            </Link>
            <Link href={`/e/${ev.slug}/descargar`} className={styles.actionAccent}>
              ⬇ Link de descarga
            </Link>
            <Link href={`/admin/${ev.id}/analytics`} className={styles.actionBtn}>
              📊 Estadísticas
            </Link>
          </>
        )}

        {expired && ev.slug && (
          <Link href={`/admin/${ev.id}/analytics`} className={styles.actionBtn}>
            📊 Estadísticas
          </Link>
        )}
      </div>

      {ev.expires_at && !expired && (
        <span className={styles.expiryNote}>Vence el {new Date(ev.expires_at).toLocaleDateString('es-AR')}</span>
      )}
    </div>
  )
}
