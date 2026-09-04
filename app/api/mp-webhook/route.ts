import { NextRequest, NextResponse } from 'next/server'
import { Payment, MercadoPagoConfig } from 'mercadopago'
import { getSupabaseServerClient } from '../../../lib/supabaseServer'
import { shouldCreateEvent } from '../../../lib/webhookDedupe'
import { verifyMpSignature } from '../../../lib/verifyMpSignature'

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.type !== 'payment') return NextResponse.json({ ok: true })

  const dataId = String(body.data?.id ?? '')
  const isValid = verifyMpSignature({
    xSignature: req.headers.get('x-signature'),
    xRequestId: req.headers.get('x-request-id'),
    dataId,
    secret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
  })
  if (!isValid) {
    return NextResponse.json({ error: 'firma inválida' }, { status: 401 })
  }

  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
  const payment = new Payment(client)
  const paymentData = await payment.get({ id: dataId })
  if (paymentData.status !== 'approved') return NextResponse.json({ ok: true })

  const supabase = getSupabaseServerClient()
  const paymentId = String(paymentData.id)

  const { data: existing } = await supabase.from('events').select('mp_payment_id')
  const existingIds = (existing ?? []).map((r) => r.mp_payment_id).filter((v): v is string => Boolean(v))

  if (!shouldCreateEvent(paymentId, existingIds)) {
    return NextResponse.json({ ok: true, deduped: true })
  }

  await supabase.from('events').insert({
    status: 'pagado_sin_configurar',
    tier: paymentData.metadata?.tier ?? 'estandar',
    customer_name: paymentData.payer?.first_name ?? null,
    customer_email: paymentData.payer?.email ?? null,
    mp_payment_id: paymentId,
  })

  return NextResponse.json({ ok: true })
}
