'use client'
import { CLOUDINARY_CLOUDS as CLOUDS } from '../../lib/cloudinaryClouds'

export async function uploadPhoto(blob: Blob, folder: string, guestName?: string): Promise<void> {
  let lastError: unknown = null
  for (const cloud of CLOUDS) {
    const form = new FormData()
    form.append('file', blob)
    form.append('upload_preset', cloud.preset)
    form.append('folder', folder)
    form.append('tags', folder)
    if (guestName) form.append('context', `name=${guestName}`)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.name}/image/upload`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) return
      lastError = await res.text()
    } catch (err) {
      lastError = err
    }
  }
  throw new Error(`No se pudo subir la foto a ninguna cuenta de Cloudinary: ${String(lastError)}`)
}

// The `image/list/<tag>.json` endpoint does NOT include secure_url/url in
// its resources (unlike the upload response) — only public_id/version/format.
// The delivery URL has to be built by hand from those.
type CloudinaryResource = { public_id: string; version: number; format: string; created_at: string }

export type PhotoEntry = { url: string; publicId: string; createdAt: string }

export async function fetchPhotoEntries(folder: string): Promise<PhotoEntry[]> {
  const results = await Promise.allSettled(
    CLOUDS.map((c) =>
      fetch(`https://res.cloudinary.com/${c.name}/image/list/${folder}.json`).then(async (r) => ({
        cloud: c.name,
        body: (await r.json()) as { resources?: CloudinaryResource[] },
      }))
    )
  )

  const entries: PhotoEntry[] = []
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value.body.resources)) {
      for (const res of r.value.body.resources) {
        const url = `https://res.cloudinary.com/${r.value.cloud}/image/upload/v${res.version}/${res.public_id}.${res.format}`
        entries.push({ url, publicId: res.public_id, createdAt: res.created_at })
      }
    }
  }
  return entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function fetchPhotos(folder: string): Promise<string[]> {
  return (await fetchPhotoEntries(folder)).map((e) => e.url)
}
