'use client'

function storageKey(folder: string) {
  return `ew_voted_${folder}`
}

function readVoted(folder: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(folder))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function hasVoted(folder: string, photoId: string): boolean {
  return readVoted(folder).includes(photoId)
}

function markVoted(folder: string, photoId: string) {
  const voted = readVoted(folder)
  voted.push(photoId)
  localStorage.setItem(storageKey(folder), JSON.stringify(voted))
}

export async function castVote(folder: string, photoId: string): Promise<number> {
  const res = await fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, photoId }),
  })
  if (!res.ok) throw new Error('No se pudo votar')
  markVoted(folder, photoId)
  const body = await res.json()
  return body.votes as number
}

export async function fetchVotes(folder: string): Promise<Record<string, number>> {
  const res = await fetch(`/api/votes?folder=${encodeURIComponent(folder)}`)
  if (!res.ok) return {}
  return res.json()
}
