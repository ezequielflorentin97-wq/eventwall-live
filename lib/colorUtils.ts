// Auto-corrects whatever a non-technical user types into a hex color field:
// stray spaces, missing "#", lowercase, 3-digit shorthand ("f0c" -> "ff00cc").
// Falls back to `fallback` only when the result truly isn't a color.
export function normalizeHexColor(input: string, fallback: string): string {
  const cleaned = input.replace(/\s+/g, '').replace(/^#*/, '').toUpperCase()

  if (/^[0-9A-F]{3}$/.test(cleaned)) {
    return '#' + cleaned.split('').map((c) => c + c).join('')
  }
  if (/^[0-9A-F]{6}$/.test(cleaned)) {
    return '#' + cleaned
  }
  return fallback
}
