'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { checkRateLimit, registerUpload } from '../useRateLimit'
import { uploadPhoto } from '../useCloudinary'
import { compressImage } from '../compressImage'
import { queuePhoto, listQueued, removeQueued } from '../offlineQueue'
import styles from '../EventApp.module.css'

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
    <div className={styles.screen} style={{ background: 'var(--upload-bg)' }}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Volver
      </button>

      <p
        className={styles.title}
        style={{ fontFamily: config.fonts.display, color: 'var(--primary)', fontSize: 'clamp(1.4rem, 5vw, 2rem)' }}
        dangerouslySetInnerHTML={{ __html: config.texts.uploadTitle }}
      />

      <div className={styles.uploadChoices}>
        <UploadButton label="🖼 Elegir de galería" disabled={uploading} onFile={handleFile} />
        <UploadButton label="📷 Sacar foto" disabled={uploading} capture onFile={handleFile} />
      </div>

      <p className={styles.statusText} role="status">
        {status}
      </p>
      {pendingCount > 0 && <p className={styles.pendingText}>{pendingCount} foto(s) esperando señal para enviarse…</p>}
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
    <label className={`${styles.btn} ${styles.uploadLabel}`}>
      {label}
      <input
        type="file"
        accept="image/*"
        capture={capture ? 'environment' : undefined}
        disabled={disabled}
        className={styles.hiddenInput}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </label>
  )
}
