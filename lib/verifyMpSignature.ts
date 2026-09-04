import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

// Implements Mercado Pago's webhook signature scheme:
// https://www.mercadopago.com.ar/developers/en/docs/your-integrations/notifications/webhooks
// x-signature looks like "ts=1704908010,v1=<hex hmac>"; the manifest hashed
// is "id:<dataId>;request-id:<x-request-id>;ts:<ts>;" using the secret from
// the MP developer dashboard (per-application, not the access token).
export function verifyMpSignature(params: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string
  secret: string
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params
  if (!xSignature || !xRequestId) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.split('=')
      return [k?.trim(), v?.trim()]
    })
  )
  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  const expectedBuf = Buffer.from(expected, 'hex')
  const actualBuf = Buffer.from(v1, 'hex')
  if (expectedBuf.length !== actualBuf.length) return false
  return timingSafeEqual(expectedBuf, actualBuf)
}
