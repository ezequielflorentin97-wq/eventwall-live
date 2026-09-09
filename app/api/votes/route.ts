import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '../../../lib/supabaseServer'
import { isLocalMode } from '../../../lib/localMode'
import { getVotes } from '../../../lib/db/voteStore'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get('folder')
  if (!folder) {
    return NextResponse.json({ error: 'falta ?folder=' }, { status: 400 })
  }

  if (isLocalMode()) {
    return NextResponse.json(await getVotes(folder))
  }

  const supabase = getSupabaseServerClient()
  const { data } = await supabase.from('photo_votes').select('photo_id, votes').eq('event_slug', folder)
  const votes: Record<string, number> = {}
  for (const row of data ?? []) votes[row.photo_id] = row.votes
  return NextResponse.json(votes)
}
