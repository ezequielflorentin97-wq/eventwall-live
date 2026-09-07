// Curated pairs instead of an open Google Fonts picker — keeps every event
// looking intentional instead of a client accidentally combining fonts that
// clash. Each id matches a Google Fonts family name pair.
export const FONT_PAIRS = [
  { id: 'cinzel', label: 'Cinzel — clásico/XV', display: 'Cinzel Decorative', body: 'Cinzel' },
  { id: 'cormorant', label: 'Cormorant Garamond — romántico/boda', display: 'Cormorant Garamond', body: 'Cormorant Garamond' },
  { id: 'playfair', label: 'Playfair Display — elegante/boda', display: 'Playfair Display', body: 'Lato' },
  { id: 'sora', label: 'Sora — moderno/corporativo', display: 'Sora', body: 'Sora' },
  { id: 'montserrat', label: 'Montserrat — limpio/corporativo', display: 'Montserrat', body: 'Montserrat' },
  { id: 'baloo', label: 'Baloo 2 + Nunito — divertido/cumpleaños', display: 'Baloo 2', body: 'Nunito' },
  { id: 'pacifico', label: 'Pacifico — casual/cumpleaños', display: 'Pacifico', body: 'Quicksand' },
  { id: 'fraunces', label: 'Fraunces + Work Sans — editorial', display: 'Fraunces', body: 'Work Sans' },
  { id: 'bebas', label: 'Bebas Neue — impacto/fiesta', display: 'Bebas Neue', body: 'Roboto' },
  { id: 'dancing', label: 'Dancing Script — manuscrita/boda', display: 'Dancing Script', body: 'Lato' },
] as const

export type FontPairId = (typeof FONT_PAIRS)[number]['id']

export function findFontPair(id: string) {
  return FONT_PAIRS.find((f) => f.id === id) ?? FONT_PAIRS[0]
}

// Every family referenced by any curated pair, loaded once globally — an
// event's config only names a font by family name (e.g. "Cinzel Decorative"),
// so the actual @font-face has to already be on the page for that name to
// render as anything but a system-font fallback.
export function googleFontsHref(): string {
  const families = new Set<string>()
  for (const pair of FONT_PAIRS) {
    families.add(pair.display)
    families.add(pair.body)
  }
  const params = Array.from(families)
    .map((name) => `family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400;700`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
