import { describe, it, expect } from 'vitest'
import { shouldCreateEvent } from '../../lib/webhookDedupe'

describe('shouldCreateEvent', () => {
  it('returns true for a payment id never seen before', () => {
    expect(shouldCreateEvent('pay_123', ['pay_999'])).toBe(true)
  })

  it('returns false if the payment id already has an event row (MP retry)', () => {
    expect(shouldCreateEvent('pay_123', ['pay_123', 'pay_999'])).toBe(false)
  })
})
