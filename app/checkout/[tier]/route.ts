import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutPreference } from '../../../lib/mercadopago'
import { PUBLIC_TIER_INFO, type TierId } from '../../../lib/tiers'
import { isLocalMode } from '../../../lib/localMode'
import { shouldSkipMercadoPago } from '../../../lib/paymentMode'
import { insertEvent } from '../../../lib/db/localStore'
import { getSupabaseServerClient } from '../../../lib/supabaseServer'

const VALID_TIERS = PUBLIC_TIER_INFO.map((t) => t.id)

export async function GET(req: NextRequest, { params }: { params: Promise<{ tier: string }> }) {
  const { tier } = await params
  if (!VALID_TIERS.includes(tier as TierId)) {
    return NextResponse.json({ error: 'tier inválido' }, { status: 400 })
  }

  if (shouldSkipMercadoPago()) {
    // No hay Mercado Pago real todavía: el "pago" se simula creando el
    // evento directamente como si el webhook ya hubiese confirmado — pero
    // en la base de datos real (Supabase) si ya está configurada, no solo
    // en modo local.
    if (isLocalMode()) {
      await insertEvent({ tier: tier as TierId, customer_name: 'QA sin MP' })
    } else {
      const supabase = getSupabaseServerClient()
      const { error } = await supabase.from('events').insert({
        status: 'pagado_sin_configurar',
        tier: tier as TierId,
        customer_name: 'QA sin MP',
      })
      if (error) {
        return NextResponse.json({ error: `No se pudo crear el evento en Supabase: ${error.message}` }, { status: 500 })
      }
    }
    return NextResponse.redirect(new URL('/checkout/gracias', req.url))
  }

  const { initPoint } = await createCheckoutPreference(tier as TierId)
  return NextResponse.redirect(initPoint)
}
