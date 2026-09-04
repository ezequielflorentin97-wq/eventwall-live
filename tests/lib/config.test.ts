import { describe, it, expect } from 'vitest'
import { mergeEventConfig, type Preset } from '../../lib/config'

const preset: Preset = {
  colors: { bg: '#000', primary: '#F0C230', dark: '#C9A84C', text: '#F5DFA0', uploadBg: '#080305' },
  fonts: { display: 'Cinzel Decorative', body: 'Cinzel' },
  texts: { homeTitle: 'Mis XV', qrSubtitle: 'a', uploadTitle: 'b', footerText: 'c' },
  slideshow: { slideMs: 4000, pauseMs: 30000 },
  rateLimit: { max: 3, windowMs: 120000 },
}

describe('mergeEventConfig', () => {
  it('applies preset defaults when override has no matching field', () => {
    const result = mergeEventConfig(preset, { eventName: 'Mis XV Kiara', cloudinaryFolder: 'kiara-xv' })
    expect(result.colors.primary).toBe('#F0C230')
    expect(result.eventName).toBe('Mis XV Kiara')
    expect(result.cloudinaryFolder).toBe('kiara-xv')
  })

  it('lets override win over preset for any field, including nested texts', () => {
    const result = mergeEventConfig(preset, {
      eventName: 'Mis XV Kiara',
      cloudinaryFolder: 'kiara-xv',
      texts: { homeTitle: 'Mis XV Kiara', qrSubtitle: 'a', uploadTitle: 'b', footerText: 'texto custom' },
    })
    expect(result.texts.footerText).toBe('texto custom')
    expect(result.texts.qrSubtitle).toBe('a')
  })
})
