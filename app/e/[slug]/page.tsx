import { notFound } from 'next/navigation'
import { getSupabaseServerClient } from '../../../lib/supabaseServer'
import { EventApp } from '../../../components/event-app/EventApp'
import type { EventConfig } from '../../../lib/config'

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { slug } = await params
  const { mode } = await searchParams
  const supabase = getSupabaseServerClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'activo')
    .single()

  if (!event) notFound()

  const guestUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/e/${slug}?mode=camera`

  return (
    <EventApp
      config={event.config as EventConfig}
      guestUrl={guestUrl}
      initialView={mode === 'camera' ? 'upload' : 'home'}
    />
  )
}
