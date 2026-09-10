export function sortByVotes<T extends { votes: number }>(photos: T[]): T[] {
  return [...photos].sort((a, b) => b.votes - a.votes)
}
