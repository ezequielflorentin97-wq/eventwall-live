import type { CSSProperties } from 'react'

// Curated visual effects for the event title — a color-aware CSS recipe per
// effect, not a free-form CSS field, so it always looks intentional.
export const TEXT_EFFECTS = [
  { id: 'ninguno', label: 'Ninguno' },
  { id: 'brillo', label: 'Brillo suave' },
  { id: 'sombra', label: 'Sombra marcada' },
  { id: 'destello', label: 'Destello animado' },
] as const

export type TextEffectId = (typeof TEXT_EFFECTS)[number]['id']

export function textEffectStyle(id: string, color: string): CSSProperties {
  switch (id) {
    case 'brillo':
      return { textShadow: `0 0 20px ${color}80, 0 0 40px ${color}40` }
    case 'sombra':
      return { textShadow: '0 4px 10px rgba(0,0,0,0.6)' }
    case 'destello':
      return { textShadow: `0 0 16px ${color}`, animation: 'ew-destello 2.4s ease-in-out infinite' }
    default:
      return {}
  }
}
