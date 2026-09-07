'use client'
import type { PhotoFilterId } from '../../lib/photoFilters'

const CSS_FILTERS: Partial<Record<PhotoFilterId, string>> = {
  byn: 'grayscale(1) contrast(1.05)',
  sepia: 'sepia(0.75) saturate(1.2)',
}

export async function applyFilter(blob: Blob, filter: PhotoFilterId): Promise<Blob> {
  if (filter === 'ninguno') return blob

  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return blob

  ctx.filter = CSS_FILTERS[filter] ?? 'none'
  ctx.drawImage(bitmap, 0, 0)

  if (filter === 'vineta') {
    ctx.filter = 'none'
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.35,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.7
    )
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('No se pudo aplicar el filtro'))), 'image/jpeg', 0.85)
  })
}
