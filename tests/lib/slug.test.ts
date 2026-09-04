import { describe, it, expect } from 'vitest'
import { slugify, withSuffixIfTaken } from '../../lib/slug'

describe('slugify', () => {
  it('lowercases, strips accents, and replaces spaces with dashes', () => {
    expect(slugify('Mis XV Kiara')).toBe('mis-xv-kiara')
    expect(slugify('Cumpleaños de Ñoño')).toBe('cumpleanos-de-nono')
  })

  it('collapses repeated separators and trims dashes', () => {
    expect(slugify('  Boda -- Ana & Juan!! ')).toBe('boda-ana-juan')
  })
})

describe('withSuffixIfTaken', () => {
  it('returns the base slug when not taken', () => {
    expect(withSuffixIfTaken('kiara-xv', ['boda-ana'])).toBe('kiara-xv')
  })

  it('appends -2, -3 etc. until it finds a free slug', () => {
    expect(withSuffixIfTaken('kiara-xv', ['kiara-xv', 'kiara-xv-2'])).toBe('kiara-xv-3')
  })
})
