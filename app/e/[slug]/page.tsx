import { notFound } from 'next/navigation'
import { getSupabaseServerClient } from '../../../lib/supabaseServer'
import { isLocalMode } from '../../../lib/localMode'
import { getEventBySlug } from '../../../lib/db/localStore'
import { EventApp } from '../../../components/event-app/EventApp'
import type { EventConfig } from '../../../lib/config'

export const dynamic = 'force-dynamic'

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { slug } = await params
  const { mode } = await searchParams

  const event = isLocalMode()
    ? await getEventBySlug(slug, 'activo')
    : await getSupabaseEvent(slug)

  if (!event) notFound()

  const guestUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/e/${slug}?mode=camera`

  return (
    <EventApp
      config={event.config as EventConfig}
      guestUrl={guestUrl}
      initialView={mode === 'camera' ? 'upload' : mode === 'pantalla' ? 'hostHome' : 'home'}
    />
  )
}

async function getSupabaseEvent(slug: string) {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase.from('events').select('*').eq('slug', slug).eq('status', 'activo').single()
  return data
}
