import { describe, it, expect } from 'vitest'
import { buildSlides } from '../../lib/buildSlides'

const photos = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}` }))
const shape = (slides: ReturnType<typeof buildSlides<{ id: string }>>) =>
  slides.map((s) => (s.kind === 'promo' ? 'PROMO' : s.photo.id)).join(',')

describe('buildSlides', () => {
  it('returns nothing when there are no photos', () => {
    expect(buildSlides([], 5)).toEqual([])
  })

  it('always closes the loop with a promo, even with fewer photos than the interval', () => {
    expect(shape(buildSlides(photos(3), 5))).toBe('p1,p2,p3,PROMO')
  })

  it('does not double the promo when the photo count is an exact multiple', () => {
    expect(shape(buildSlides(photos(5), 5))).toBe('p1,p2,p3,p4,p5,PROMO')
  })

  it('inserts a promo after every N photos plus one at the end', () => {
    expect(shape(buildSlides(photos(7), 3))).toBe('p1,p2,p3,PROMO,p4,p5,p6,PROMO,p7,PROMO')
  })

  it('keeps photo order intact', () => {
    const slides = buildSlides(photos(4), 2)
    expect(slides.filter((s) => s.kind === 'photo').map((s) => (s as { photo: { id: string } }).photo.id)).toEqual(['p1', 'p2', 'p3', 'p4'])
  })

  it('falls back to a sane interval when given a non-positive one', () => {
    expect(shape(buildSlides(photos(2), 0))).toBe('p1,p2,PROMO')
  })
})
