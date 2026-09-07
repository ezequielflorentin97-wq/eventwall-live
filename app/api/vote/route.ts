import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabaseServer'
import { isLocalMode } from '../../../lib/localMode'
import { incrementVote } from '../../../lib/db/voteStore'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const folder = String(body.folder ?? '')
  const photoId = String(body.photoId ?? '')
  if (!folder || !photoId) {
    return NextResponse.json({ error: 'folder y photoId son requeridos' }, { status: 400 })
  }

  if (isLocalMode()) {
    const votes = await incrementVote(folder, photoId)
    return NextResponse.json({ votes })
  }

  const supabase = getSupabaseServerClient()
  const { data: existing } = await supabase
    .from('photo_votes')
    .select('votes')
    .eq('event_slug', folder)
    .eq('photo_id', photoId)
    .maybeSingle()

  const votes = (existing?.votes ?? 0) + 1
  await supabase.from('photo_votes').upsert({ event_slug: folder, photo_id: photoId, votes })

  return NextResponse.json({ votes })
}
