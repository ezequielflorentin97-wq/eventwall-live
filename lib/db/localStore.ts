import 'server-only'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { EventConfig } from '../config'

export type EventStatus = 'pagado_sin_configurar' | 'activo' | 'vencido'
export type EventTier = 'basico' | 'estandar' | 'premium'

export type EventRow = {
  id: string
  slug: string | null
  status: EventStatus
  tier: EventTier
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  mp_payment_id: string | null
  config: EventConfig | null
  created_at: string
  configured_at: string | null
  expires_at: string | null
}

// Local-mode-only persistence: a JSON file under local-data/, gitignored.
// Mirrors the shape of the Supabase `events` table so the rest of the app
// (admin pages, wizard, event page) can branch on isLocalMode() without
// duplicating logic beyond the storage layer itself.
const DATA_DIR = path.join(process.cwd(), 'local-data')
const DATA_FILE = path.join(DATA_DIR, 'events.json')

async function readAll(): Promise<EventRow[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw) as EventRow[]
  } catch {
    return []
  }
}

async function writeAll(events: EventRow[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8')
}

export async function listEvents(): Promise<EventRow[]> {
  const events = await readAll()
  return events.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export async function getEventBySlug(slug: string, status?: EventStatus): Promise<EventRow | null> {
  const events = await readAll()
  return events.find((e) => e.slug === slug && (!status || e.status === status)) ?? null
}

export async function insertEvent(input: {
  tier: EventTier
  customer_name?: string | null
  customer_email?: string | null
}): Promise<EventRow> {
  const events = await readAll()
  const row: EventRow = {
    id: randomUUID(),
    slug: null,
    status: 'pagado_sin_configurar',
    tier: input.tier,
    customer_name: input.customer_name ?? null,
    customer_email: input.customer_email ?? null,
    customer_phone: null,
    mp_payment_id: null,
    config: null,
    created_at: new Date().toISOString(),
    configured_at: null,
    expires_at: null,
  }
  events.push(row)
  await writeAll(events)
  return row
}

export async function updateEvent(
  id: string,
  patch: Partial<Pick<EventRow, 'slug' | 'config' | 'status' | 'configured_at' | 'expires_at'>>
): Promise<EventRow | null> {
  const events = await readAll()
  const index = events.findIndex((e) => e.id === id)
  if (index === -1) return null
  events[index] = { ...events[index], ...patch }
  await writeAll(events)
  return events[index]
}

export async function listSlugs(): Promise<string[]> {
  const events = await readAll()
  return events.map((e) => e.slug).filter((s): s is string => Boolean(s))
}

export async function listExpiredActiveEvents(nowIso: string = new Date().toISOString()): Promise<EventRow[]> {
  const events = await readAll()
  return events.filter((e) => e.status === 'activo' && e.expires_at !== null && e.expires_at < nowIso)
}
