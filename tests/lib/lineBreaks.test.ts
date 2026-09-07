import { describe, it, expect } from 'vitest'
import { toStorage, toEditable } from '../../lib/lineBreaks'

describe('toStorage', () => {
  it('converts a real newline to <br>', () => {
    expect(toStorage('Mis XV\nKiara')).toBe('Mis XV<br>Kiara')
  })

  it('handles Windows-style line endings', () => {
    expect(toStorage('Mis XV\r\nKiara')).toBe('Mis XV<br>Kiara')
  })

  it('leaves text without line breaks untouched', () => {
    expect(toStorage('Mis XV Kiara')).toBe('Mis XV Kiara')
  })
})

describe('toEditable', () => {
  it('converts <br> back to a real newline for editing', () => {
    expect(toEditable('Mis XV<br>Kiara')).toBe('Mis XV\nKiara')
  })

  it('handles self-closing and spaced <br /> variants', () => {
    expect(toEditable('Mis XV<br/>Kiara<br />Test')).toBe('Mis XV\nKiara\nTest')
  })
})
