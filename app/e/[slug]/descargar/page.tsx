import { notFound } from 'next/navigation'
import { getSupabaseServerClient } from '../../../../lib/supabaseServer'
import { isLocalMode } from '../../../../lib/localMode'
import { getEventBySlug, type EventRow } from '../../../../lib/db/localStore'
import { daysRemaining } from '../../../../lib/retention'
import { DownloadAllButton } from '../../../../components/event-app/DownloadAllButton'
import type { EventConfig } from '../../../../lib/config'

export const dynamic = 'force-dynamic'

export default async function DownloadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const event = isLocalMode() ? await getEventBySlug(slug) : await getSupabaseEvent(slug)
  if (!event || !event.config) notFound()

  const config = event.config as EventConfig
  const expired = event.status === 'vencido' || (event.expires_at !== null && new Date(event.expires_at) < new Date())
  const remaining = event.expires_at ? daysRemaining(event.expires_at) : null

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.4rem',
        padding: '2rem',
        background: config.colors.bg,
        color: config.colors.text,
        fontFamily: config.fonts.body,
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontFamily: config.fonts.display, color: config.colors.primary }} dangerouslySetInnerHTML={{ __html: config.eventName }} />

      {expired ? (
        <p>Las fotos de este evento ya no están disponibles — pasó el plazo de 30 días de descarga.</p>
      ) : (
        <>
          {remaining !== null && <p>Quedan {remaining} {remaining === 1 ? 'día' : 'días'} para descargar las fotos.</p>}
          <DownloadAllButton folder={config.cloudinaryFolder} eventName={config.eventName} />
        </>
      )}
    </main>
  )
}

async function getSupabaseEvent(slug: string): Promise<EventRow | null> {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle()
  return data as EventRow | null
}
