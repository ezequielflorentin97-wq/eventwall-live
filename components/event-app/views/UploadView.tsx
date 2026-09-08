'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { checkRateLimit, registerUpload } from '../useRateLimit'
import { uploadPhoto } from '../useCloudinary'
import { compressImage } from '../compressImage'
import { queuePhoto, listQueued, removeQueued } from '../offlineQueue'

export function UploadView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)
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
      try {
        await uploadPhoto(compressed, config.cloudinaryFolder)
        registerUpload()
        setStatus('¡Foto compartida!')
      } catch {
        await queuePhoto(config.cloudinaryFolder, compressed)
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

      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <UploadButton label="🖼 Elegir de galería" disabled={uploading} onFile={handleFile} />
        <UploadButton label="📷 Sacar foto" disabled={uploading} capture onFile={handleFile} />
      </div>

      <p role="status">{status}</p>
      {pendingCount > 0 && <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{pendingCount} foto(s) esperando señal para enviarse…</p>}
      <button onClick={onBack}>← Volver</button>
    </div>
  )
}

function UploadButton({
  label,
  disabled,
  capture,
  onFile,
}: {
  label: string
  disabled: boolean
  capture?: boolean
  onFile: (file: File) => void
}) {
  return (
    <label style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <span style={{ border: '1px solid currentColor', borderRadius: 6, padding: '0.6rem 1rem', display: 'inline-block', opacity: disabled ? 0.5 : 1 }}>
        {label}
      </span>
      <input
        type="file"
        accept="image/*"
        capture={capture ? 'environment' : undefined}
        disabled={disabled}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </label>
  )
}
