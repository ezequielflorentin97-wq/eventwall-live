import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../../lib/supabaseServer'
import { isLocalMode } from '../../../../lib/localMode'
import { listExpiredActiveEvents, updateEvent as updateLocalEvent, type EventRow } from '../../../../lib/db/localStore'
import { deleteFolderPhotos } from '../../../../lib/cloudinaryAdmin'
import type { EventConfig } from '../../../../lib/config'

// Runs daily (configure as a Vercel Cron Job hitting this route, or any
// external scheduler) to purge photos past the 30-day retention window
// (see lib/retention.ts) and mark those events 'vencido'. Protected by
// CRON_SECRET so it can't be triggered by a random request.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const expired = isLocalMode() ? await listExpiredActiveEvents() : await listSupabaseExpired()

  const results = []
  for (const event of expired) {
    const config = event.config as EventConfig | null
    if (!config) continue

    try {
      const { totalDeleted, perAccount } = await deleteFolderPhotos(config.cloudinaryFolder)
      await markVencido(event.id)
      results.push({ slug: event.slug, deleted: totalDeleted, perAccount, ok: true })
    } catch (err) {
      results.push({ slug: event.slug, ok: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}

async function listSupabaseExpired(): Promise<EventRow[]> {
  const supabase = getSupabaseServerClient()
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'activo')
    .lt('expires_at', new Date().toISOString())
  return (data ?? []) as EventRow[]
}

async function markVencido(eventId: string) {
  if (isLocalMode()) {
    await updateLocalEvent(eventId, { status: 'vencido' })
    return
  }
  const supabase = getSupabaseServerClient()
  await supabase.from('events').update({ status: 'vencido' }).eq('id', eventId)
}
