import { isLocalMode } from './localMode'

// Independent from isLocalMode(): lets you test against a real Supabase
// project while still skipping real Mercado Pago (no valid credentials
// yet, or just don't want to hit the real payment flow while developing).
export function shouldSkipMercadoPago(): boolean {
  if (process.env.SKIP_MERCADOPAGO === 'true') return true
  if (process.env.SKIP_MERCADOPAGO === 'false') return false
  return isLocalMode()
}
