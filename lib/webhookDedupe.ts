export function shouldCreateEvent(paymentId: string, existingPaymentIds: string[]): boolean {
  return !existingPaymentIds.includes(paymentId)
}
