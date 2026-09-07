'use client'

// Mirrors the compression the original kiara-xv-final.html did before
// upload: cap at 1600px on the long edge, re-encode as JPEG at 78%
// quality — keeps ~350KB/photo instead of the 3-5MB an iPhone produces.
export async function compressImage(
  file: File,
  maxW = 1600,
  maxH = 1600,
  quality = 0.78
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D del canvas')
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen'))),
      'image/jpeg',
      quality
    )
  })
}
