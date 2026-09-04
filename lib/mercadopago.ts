import 'server-only'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { PUBLIC_TIER_INFO, type TierId } from './tiers'

function getClient() {
  return new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
}

// Mercado Pago Argentina only accepts ARS in Checkout Pro preferences — a
// USD preference is rejected outright for an AR seller account. We keep the
// USD figure as the source of truth (see lib/tiers.ts) and convert here.
function usdToArs(usd: number): number {
  const rate = Number(process.env.MP_ARS_PER_USD)
  if (!rate || Number.isNaN(rate)) {
    throw new Error('MP_ARS_PER_USD no está configurado — no se puede generar un precio en ARS')
  }
  return Math.round(usd * rate)
}

export async function createCheckoutPreference(tier: TierId) {
  const tierInfo = PUBLIC_TIER_INFO.find((t) => t.id === tier)
  if (!tierInfo) throw new Error(`Tier desconocido: ${tier}`)

  const client = getClient()
  const preference = new Preference(client)
  const result = await preference.create({
    body: {
      items: [
        {
          id: tierInfo.id,
          title: `EventWall Live — plan ${tierInfo.name}`,
          quantity: 1,
          unit_price: usdToArs(tierInfo.priceUsd),
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/gracias`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      },
      metadata: { tier: tierInfo.id },
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mp-webhook`,
    },
  })

  if (!result.init_point) throw new Error('Mercado Pago no devolvió init_point')
  return { initPoint: result.init_point }
}
