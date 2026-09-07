import { describe, it, expect } from 'vitest'
import { computeExpiresAt, daysRemaining } from '../../lib/retention'

describe('computeExpiresAt', () => {
  it('adds the given number of days to the source date', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z', 30)).toBe('2026-01-31T00:00:00.000Z')
  })

  it('defaults to 30 days when not specified', () => {
    expect(computeExpiresAt('2026-01-01T00:00:00.000Z')).toBe('2026-01-31T00:00:00.000Z')
  })
})

describe('daysRemaining', () => {
  it('returns the whole number of days left, rounded up', () => {
    expect(daysRemaining('2026-01-31T00:00:00.000Z', '2026-01-01T00:00:00.000Z')).toBe(30)
    expect(daysRemaining('2026-01-02T12:00:00.000Z', '2026-01-01T00:00:00.000Z')).toBe(2)
  })

  it('never returns negative days once expired', () => {
    expect(daysRemaining('2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z')).toBe(0)
  })
})
