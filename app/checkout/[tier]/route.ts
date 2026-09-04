import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutPreference } from '../../../lib/mercadopago'
import { PUBLIC_TIER_INFO, type TierId } from '../../../lib/tiers'

const VALID_TIERS = PUBLIC_TIER_INFO.map((t) => t.id)

export async function GET(_req: NextRequest, { params }: { params: Promise<{ tier: string }> }) {
  const { tier } = await params
  if (!VALID_TIERS.includes(tier as TierId)) {
    return NextResponse.json({ error: 'tier inválido' }, { status: 400 })
  }
  const { initPoint } = await createCheckoutPreference(tier as TierId)
  return NextResponse.redirect(initPoint)
}
