import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutPreference } from '../../../lib/mercadopago'
import { PUBLIC_TIER_INFO, type TierId } from '../../../lib/tiers'
import { isLocalMode } from '../../../lib/localMode'
import { insertEvent } from '../../../lib/db/localStore'

const VALID_TIERS = PUBLIC_TIER_INFO.map((t) => t.id)

export async function GET(req: NextRequest, { params }: { params: Promise<{ tier: string }> }) {
  const { tier } = await params
  if (!VALID_TIERS.includes(tier as TierId)) {
    return NextResponse.json({ error: 'tier inválido' }, { status: 400 })
  }

  if (isLocalMode()) {
    // No hay Mercado Pago real en modo local: el "pago" se simula creando
    // el evento directamente como si el webhook ya hubiese confirmado.
    await insertEvent({ tier: tier as TierId, customer_name: 'QA Local' })
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  const { initPoint } = await createCheckoutPreference(tier as TierId)
  return NextResponse.redirect(initPoint)
}
