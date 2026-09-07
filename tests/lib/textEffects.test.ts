import { describe, it, expect } from 'vitest'
import { textEffectStyle } from '../../lib/textEffects'

describe('textEffectStyle', () => {
  it('returns no style for "ninguno"', () => {
    expect(textEffectStyle('ninguno', '#F0C230')).toEqual({})
  })

  it('returns a glow textShadow using the given color for "brillo"', () => {
    const style = textEffectStyle('brillo', '#F0C230')
    expect(style.textShadow).toContain('#F0C230')
  })

  it('returns an animated style for "destello"', () => {
    const style = textEffectStyle('destello', '#F0C230')
    expect(style.animation).toBeDefined()
  })

  it('falls back to no style for an unknown id', () => {
    expect(textEffectStyle('inventado', '#F0C230')).toEqual({})
  })
})
