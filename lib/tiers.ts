// Prices are quoted in USD as the reference value (see the GTM brief) because
// the peso is volatile — the actual charge is converted to ARS at checkout
// time (Mercado Pago Argentina only settles in ARS), using MP_ARS_PER_USD.
// Update that env var regularly; it is not fetched live from any API.
export const PUBLIC_TIER_INFO = [
  {
    id: 'basico',
    name: 'Básico',
    priceUsd: 45,
    features: ['Cumpleaños, eventos <80 invitados', '1 preset de estética', 'QR + slideshow + contador de fotos'],
  },
  {
    id: 'estandar',
    name: 'Estándar',
    priceUsd: 75,
    features: ['XV, aniversarios, corporativo chico', 'Estética a medida', 'Nombre de invitado + watermark', 'Moderación manual el día del evento'],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceUsd: 120,
    features: ['Casamientos, corporativo grande', 'Todo lo de Estándar', 'Soporte en vivo el día del evento'],
  },
] as const

export type TierId = (typeof PUBLIC_TIER_INFO)[number]['id']
