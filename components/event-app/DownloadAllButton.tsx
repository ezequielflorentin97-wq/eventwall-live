'use client'
import { useState } from 'react'
import JSZip from 'jszip'
import { fetchPhotos } from './useCloudinary'

// Bundles every photo into a ZIP entirely client-side (fetch + JSZip) — no
// Cloudinary Admin API needed for this part, only the public list/fetch
// endpoints the display view already uses.
export function DownloadAllButton({ folder, eventName }: { folder: string; eventName: string }) {
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle')
  const [progress, setProgress] = useState('')

  async function handleDownload() {
    setStatus('working')
    try {
      const urls = await fetchPhotos(folder)
      if (urls.length === 0) {
        setStatus('error')
        setProgress('Todavía no hay fotos subidas.')
        return
      }

      const zip = new JSZip()
      for (let i = 0; i < urls.length; i++) {
        setProgress(`Descargando foto ${i + 1} de ${urls.length}…`)
        const blob = await fetch(urls[i]).then((r) => r.blob())
        zip.file(`foto-${String(i + 1).padStart(3, '0')}.jpg`, blob)
      }

      setProgress('Armando el ZIP…')
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${folder}-fotos.zip`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('idle')
      setProgress('')
    } catch {
      setStatus('error')
      setProgress('No se pudo armar el ZIP, probá de nuevo.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
      <button onClick={handleDownload} disabled={status === 'working'}>
        {status === 'working' ? 'Preparando…' : `Descargar todas las fotos de ${eventName}`}
      </button>
      {progress && <p role="status" style={{ fontSize: '0.8rem' }}>{progress}</p>}
    </div>
  )
}
