import { describe, it, expect } from 'vitest'
import { normalizeHexColor } from '../../lib/colorUtils'

describe('normalizeHexColor', () => {
  it('adds the leading # when missing', () => {
    expect(normalizeHexColor('F0C230', '#000000')).toBe('#F0C230')
  })

  it('strips stray spaces and extra #', () => {
    expect(normalizeHexColor('  # f0 c2 30 ', '#000000')).toBe('#F0C230')
  })

  it('expands 3-digit shorthand to 6 digits', () => {
    expect(normalizeHexColor('f0c', '#000000')).toBe('#FF00CC')
  })

  it('uppercases lowercase hex', () => {
    expect(normalizeHexColor('#abcdef', '#000000')).toBe('#ABCDEF')
  })

  it('falls back when the input is not a valid color', () => {
    expect(normalizeHexColor('no es un color', '#123456')).toBe('#123456')
  })
})
