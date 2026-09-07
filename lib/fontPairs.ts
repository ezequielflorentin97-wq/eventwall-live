// Curated pairs instead of an open Google Fonts picker — keeps every event
// looking intentional instead of a client accidentally combining fonts that
// clash. Each id matches a Google Fonts family name pair.
export const FONT_PAIRS = [
  { id: 'cinzel', label: 'Cinzel — clásico/XV', display: 'Cinzel Decorative', body: 'Cinzel' },
  { id: 'cormorant', label: 'Cormorant Garamond — romántico/boda', display: 'Cormorant Garamond', body: 'Cormorant Garamond' },
  { id: 'sora', label: 'Sora — moderno/corporativo', display: 'Sora', body: 'Sora' },
  { id: 'baloo', label: 'Baloo 2 + Nunito — divertido/cumpleaños', display: 'Baloo 2', body: 'Nunito' },
  { id: 'fraunces', label: 'Fraunces + Work Sans — editorial', display: 'Fraunces', body: 'Work Sans' },
] as const

export type FontPairId = (typeof FONT_PAIRS)[number]['id']

export function findFontPair(id: string) {
  return FONT_PAIRS.find((f) => f.id === id) ?? FONT_PAIRS[0]
}
