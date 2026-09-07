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

type CloudinaryResource = { secure_url?: string; url?: string; created_at: string; public_id: string }

export type PhotoEntry = { url: string; publicId: string; createdAt: string }

export async function fetchPhotoEntries(folder: string): Promise<PhotoEntry[]> {
  const results = await Promise.allSettled(
    CLOUDS.map((c) =>
      fetch(`https://res.cloudinary.com/${c.name}/image/list/${folder}.json`).then((r) => r.json())
    )
  )

  const entries: PhotoEntry[] = []
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value?.resources)) {
      for (const res of r.value.resources as CloudinaryResource[]) {
        const url = res.secure_url ?? res.url
        if (url) entries.push({ url, publicId: res.public_id, createdAt: res.created_at })
      }
    }
  }
  return entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function fetchPhotos(folder: string): Promise<string[]> {
  return (await fetchPhotoEntries(folder)).map((e) => e.url)
}
