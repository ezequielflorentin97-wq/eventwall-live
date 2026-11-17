export type Slide<T> = { kind: 'photo'; photo: T } | { kind: 'promo' }

// Interleaves a "vote for the best photo" promo slide after every `every`
// photos, and always closes the loop with one so it still shows when an
// event has fewer photos than the interval.
export function buildSlides<T>(photos: T[], every: number): Slide<T>[] {
  if (photos.length === 0) return []
  const step = every > 0 ? every : 5
  const slides: Slide<T>[] = []
  photos.forEach((photo, i) => {
    slides.push({ kind: 'photo', photo })
    const isLast = i === photos.length - 1
    if ((i + 1) % step === 0 && !isLast) slides.push({ kind: 'promo' })
  })
  slides.push({ kind: 'promo' })
  return slides
}
