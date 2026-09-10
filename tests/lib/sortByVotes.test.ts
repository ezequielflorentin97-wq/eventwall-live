import { describe, it, expect } from 'vitest'
import { sortByVotes } from '../../lib/sortByVotes'

describe('sortByVotes', () => {
  it('ordena las fotos de más a menos votadas', () => {
    const photos = [
      { id: 'a', votes: 2 },
      { id: 'b', votes: 5 },
      { id: 'c', votes: 0 },
    ]
    expect(sortByVotes(photos).map((p) => p.id)).toEqual(['b', 'a', 'c'])
  })

  it('no muta el array original', () => {
    const photos = [
      { id: 'a', votes: 1 },
      { id: 'b', votes: 2 },
    ]
    const original = [...photos]
    sortByVotes(photos)
    expect(photos).toEqual(original)
  })

  it('mantiene el orden original entre fotos con el mismo puntaje', () => {
    const photos = [
      { id: 'a', votes: 3 },
      { id: 'b', votes: 3 },
    ]
    expect(sortByVotes(photos).map((p) => p.id)).toEqual(['a', 'b'])
  })
})
