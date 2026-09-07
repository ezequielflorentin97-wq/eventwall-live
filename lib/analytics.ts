import 'server-only'
import { CLOUDINARY_CLOUDS } from './cloudinaryClouds'

type CloudinaryResource = { public_id: string; created_at: string; context?: { custom?: { name?: string } } }

export type EventAnalytics = {
  totalPhotos: number
  uploadsByDay: { date: string; count: number }[]
  uploaders: { name: string; count: number }[]
  firstUpload: string | null
  lastUpload: string | null
}

// Deliberately reads straight from Cloudinary's public list endpoint instead
// of a new table — every photo's upload timestamp (and optional guest name,
// set via the `context=name=...` field) is already there, so this is a
// read-only aggregation, not new data collection.
export async function fetchEventAnalytics(folder: string): Promise<EventAnalytics> {
  const results = await Promise.allSettled(
    CLOUDINARY_CLOUDS.map((c) =>
      fetch(`https://res.cloudinary.com/${c.name}/image/list/${folder}.json`).then((r) => r.json())
    )
  )

  const resources: CloudinaryResource[] = []
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value?.resources)) {
      resources.push(...(r.value.resources as CloudinaryResource[]))
    }
  }

  const byDay = new Map<string, number>()
  const byUploader = new Map<string, number>()
  let first: string | null = null
  let last: string | null = null

  for (const r of resources) {
    const day = r.created_at.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)

    const name = r.context?.custom?.name?.trim()
    if (name) byUploader.set(name, (byUploader.get(name) ?? 0) + 1)

    if (!first || r.created_at < first) first = r.created_at
    if (!last || r.created_at > last) last = r.created_at
  }

  return {
    totalPhotos: resources.length,
    uploadsByDay: Array.from(byDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    uploaders: Array.from(byUploader.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    firstUpload: first,
    lastUpload: last,
  }
}
