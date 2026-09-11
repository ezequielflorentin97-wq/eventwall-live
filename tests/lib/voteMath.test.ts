import { describe, it, expect } from 'vitest'
import { clampDecrement } from '../../lib/voteMath'

describe('clampDecrement', () => {
  it('decrements by one', () => {
    expect(clampDecrement(5)).toBe(4)
  })

  it('never goes below zero', () => {
    expect(clampDecrement(0)).toBe(0)
  })
})
