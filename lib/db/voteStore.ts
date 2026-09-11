import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { clampDecrement } from '../voteMath'

// Local-mode-only vote counters, mirrored in Supabase's `photo_votes` table
// for production (see supabase/migrations/0002_votes.sql). Keyed by the
// Cloudinary folder (== event slug) and the photo's Cloudinary public_id.
const DATA_DIR = path.join(process.cwd(), 'local-data')
const DATA_FILE = path.join(DATA_DIR, 'votes.json')

type VotesByFolder = Record<string, Record<string, number>>

async function readAll(): Promise<VotesByFolder> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as VotesByFolder
  } catch {
    return {}
  }
}

async function writeAll(data: VotesByFolder): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function incrementVote(folder: string, photoId: string): Promise<number> {
  const all = await readAll()
  const forFolder = all[folder] ?? {}
  forFolder[photoId] = (forFolder[photoId] ?? 0) + 1
  all[folder] = forFolder
  await writeAll(all)
  return forFolder[photoId]
}

export async function decrementVote(folder: string, photoId: string): Promise<number> {
  const all = await readAll()
  const forFolder = all[folder] ?? {}
  forFolder[photoId] = clampDecrement(forFolder[photoId] ?? 0)
  all[folder] = forFolder
  await writeAll(all)
  return forFolder[photoId]
}

export async function getVotes(folder: string): Promise<Record<string, number>> {
  const all = await readAll()
  return all[folder] ?? {}
}
