import Link from 'next/link'
import { getSupabaseServerClient } from '../../lib/supabaseServer'
import { isLocalMode } from '../../lib/localMode'
import { listEvents as listLocalEvents, type EventRow } from '../../lib/db/localStore'
import { fetchStorageUsage } from '../../lib/cloudinaryAdmin'
import { EmptyPhotosButton } from '../../components/admin/EmptyPhotosButton'
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

      <StorageUsage />

      {events.length === 0 && <p className={styles.emptyState}>Todavía no hay eventos pagados.</p>}

      <div className={styles.eventList}>
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} />
        ))}
      </div>
    </main>
  )
}

async function StorageUsage() {
  let report
  try {
    report = await fetchStorageUsage()
  } catch (err) {
    return (
      <p style={{ fontSize: '0.8rem', color: '#c0392b', marginBottom: '1.4rem' }}>
        No se pudo consultar el uso de almacenamiento de Cloudinary: {err instanceof Error ? err.message : String(err)}
      </p>
    )
  }

  if (report.accounts.length === 0) {
    return (
      <p style={{ fontSize: '0.8rem', color: '#9a6300', marginBottom: '1.4rem' }}>
        No hay credenciales de Admin API configuradas todavía — no se puede validar el uso de almacenamiento de Cloudinary
        (cuentas sin configurar: {report.skipped.join(', ')}).
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
      {report.accounts.map((acc) => {
        const pct = acc.credits.limit ? Math.round((acc.credits.used / acc.credits.limit) * 100) : null
        const warn = pct !== null && pct >= 80
        return (
          <div
            key={acc.cloud}
            style={{
              border: '1px solid #e5e5ea',
              borderRadius: 10,
              padding: '0.7rem 1rem',
              fontSize: '0.8rem',
              background: warn ? '#fbf0da' : '#fff',
            }}
          >
            <strong>{acc.cloud}</strong> ({acc.plan}) — {(acc.storageBytes / 1024 / 1024).toFixed(0)} MB usados
            {pct !== null && <> · {pct}% de créditos gratis</>}
            {warn && <span style={{ color: '#9a6300' }}> ⚠ cerca del límite</span>}
          </div>
        )
      })}
      {report.skipped.length > 0 && (
        <div style={{ fontSize: '0.75rem', color: '#888', alignSelf: 'center' }}>
          Sin validar: {report.skipped.join(', ')} (falta credencial de Admin API)
        </div>
      )}
    </div>
  )
}

function EventCard({ event: ev }: { event: EventRow }) {
  const displayName = ev.customer_name ?? ev.customer_email ?? 'Sin nombre'
  const expired = ev.status === 'vencido'
  const eventName = ev.config?.eventName?.replace(/<br\s*\/?>/gi, ' ') ?? displayName

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
            <Link href={`/admin/${ev.id}/wizard`} className={styles.actionBtn}>
              🎨 Editar diseño
            </Link>
            <EmptyPhotosButton eventId={ev.id} eventName={eventName} />
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
