'use client'
import { CLOUDINARY_CLOUDS as CLOUDS } from '../../lib/cloudinaryClouds'

// Voice messages reuse the same Cloudinary accounts as photos, but as the
// "video" resource type (Cloudinary's category for any audio/video upload)
// under a "<folder>-voz" tag so they never mix with the photo slideshow feed.

function voiceTag(folder: string) {
  return `${folder}-voz`
}

export async function uploadVoiceMessage(blob: Blob, folder: string): Promise<void> {
  let lastError: unknown = null
  for (const cloud of CLOUDS) {
    const form = new FormData()
    form.append('file', blob)
    form.append('upload_preset', cloud.preset)
    form.append('folder', voiceTag(folder))
    form.append('tags', voiceTag(folder))
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.name}/video/upload`, { method: 'POST', body: form })
      if (res.ok) return
      lastError = await res.text()
    } catch (err) {
      lastError = err
    }
  }
  throw new Error(`No se pudo subir el mensaje: ${String(lastError)}`)
}

type VideoResource = { secure_url?: string; url?: string; created_at: string }

export async function fetchVoiceMessages(folder: string): Promise<string[]> {
  const results = await Promise.allSettled(
    CLOUDS.map((c) => fetch(`https://res.cloudinary.com/${c.name}/video/list/${voiceTag(folder)}.json`).then((r) => r.json()))
  )
  const entries: { url: string; createdAt: string }[] = []
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value?.resources)) {
      for (const res of r.value.resources as VideoResource[]) {
        const url = res.secure_url ?? res.url
        if (url) entries.push({ url, createdAt: res.created_at })
      }
    }
  }
  return entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map((e) => e.url)
}
