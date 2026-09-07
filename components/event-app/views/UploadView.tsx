'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { checkRateLimit, registerUpload } from '../useRateLimit'
import { uploadPhoto } from '../useCloudinary'
import { compressImage } from '../compressImage'
import { applyFilter } from '../photoFilters'
import { PHOTO_FILTERS, type PhotoFilterId } from '../../../lib/photoFilters'
import { queuePhoto, listQueued, removeQueued } from '../offlineQueue'

export function UploadView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<PhotoFilterId>('ninguno')
  const [pendingCount, setPendingCount] = useState(0)

  async function flushQueue() {
    const queued = await listQueued(config.cloudinaryFolder)
    if (queued.length === 0) {
      setPendingCount(0)
      return
    }
    setPendingCount(queued.length)
    for (const item of queued) {
      try {
        await uploadPhoto(item.blob, config.cloudinaryFolder)
        await removeQueued(item.id)
      } catch {
        // still offline or Cloudinary unreachable — leave it queued, try again later
        break
      }
    }
    const remaining = await listQueued(config.cloudinaryFolder)
    setPendingCount(remaining.length)
  }

  useEffect(() => {
    // Syncing with IndexedDB (an external system) on mount + on 'online' —
    // not a derived-state pattern the lint rule's alternative applies to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    flushQueue()
    window.addEventListener('online', flushQueue)
    return () => window.removeEventListener('online', flushQueue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.cloudinaryFolder])

  async function handleFile(file: File) {
    if (!checkRateLimit(config.rateLimit.max, config.rateLimit.windowMs)) {
      setStatus('Alcanzaste el límite, podrás subir tu imagen en unos minutos')
      return
    }
    setUploading(true)
    setStatus('Subiendo...')
    try {
      const compressed = await compressImage(file)
      const filtered = filter === 'ninguno' ? compressed : await applyFilter(compressed, filter)
      try {
        await uploadPhoto(filtered, config.cloudinaryFolder)
        registerUpload()
        setStatus('¡Foto compartida!')
      } catch {
        await queuePhoto(config.cloudinaryFolder, filtered)
        registerUpload()
        setStatus('Sin señal — guardamos tu foto y se envía sola apenas vuelva la conexión.')
        setPendingCount((n) => n + 1)
      }
    } catch {
      setStatus('No se pudo procesar la foto, probá de nuevo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1.5rem',
        padding: '2.5rem 1.5rem',
        background: 'var(--upload-bg)',
      }}
    >
      <p style={{ fontFamily: config.fonts.display, textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: config.texts.uploadTitle }} />

      <label style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
        Filtro (opcional)
        <select value={filter} onChange={(e) => setFilter(e.target.value as PhotoFilterId)}>
          {PHOTO_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <p role="status">{status}</p>
      {pendingCount > 0 && <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{pendingCount} foto(s) esperando señal para enviarse…</p>}
      <button onClick={onBack}>← Volver</button>
    </div>
  )
}
