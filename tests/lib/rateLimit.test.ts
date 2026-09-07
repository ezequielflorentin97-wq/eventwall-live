import { describe, it, expect } from 'vitest'
import { isWithinLimit } from '../../lib/rateLimit'

describe('isWithinLimit', () => {
  it('allows uploads when under the max within the window', () => {
    const now = 1_000_000
    expect(isWithinLimit([now - 1000, now - 2000], now, 3, 120000)).toBe(true)
  })

  it('blocks uploads once max is reached within the window', () => {
    const now = 1_000_000
    expect(isWithinLimit([now - 1000, now - 2000, now - 3000], now, 3, 120000)).toBe(false)
  })

  it('ignores timestamps outside the window', () => {
    const now = 1_000_000
    const old = now - 200000
    expect(isWithinLimit([old, old, old], now, 3, 120000)).toBe(true)
  })
})
