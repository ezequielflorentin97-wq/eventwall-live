'use client'
import { useEffect, useState, type CSSProperties } from 'react'
import type { EventConfig } from '../../lib/config'
import { checkRateLimit, registerUpload } from './useRateLimit'
import { uploadPhoto, fetchPhotos } from './useCloudinary'
import { compressImage } from './compressImage'
import { QrCode } from './QrCode'
import { textEffectStyle } from '../../lib/textEffects'

type View = 'home' | 'qr' | 'upload' | 'display'

export function EventApp({
  config,
  guestUrl,
  initialView = 'home',
}: {
  config: EventConfig
  guestUrl: string
  initialView?: View
}) {
  const [view, setView] = useState<View>(initialView)
  const [status, setStatus] = useState('')
  const [uploading, setUploading] = useState(false)

  const style = {
    '--bg': config.colors.bg,
    '--primary': config.colors.primary,
    '--dark': config.colors.dark,
    '--text': config.colors.text,
    '--upload-bg': config.colors.uploadBg,
    background: 'var(--bg)',
    color: 'var(--text)',
    minHeight: '100vh',
    fontFamily: config.fonts.body,
  } as CSSProperties

  async function handleFile(file: File) {
    if (!checkRateLimit(config.rateLimit.max, config.rateLimit.windowMs)) {
      setStatus('Alcanzaste el límite, podrás subir tu imagen en unos minutos')
      return
    }
    setUploading(true)
    setStatus('Subiendo...')
    try {
      const compressed = await compressImage(file)
      await uploadPhoto(compressed, config.cloudinaryFolder)
      registerUpload()
      setStatus('¡Foto compartida!')
    } catch {
      setStatus('No se pudo subir la foto, probá de nuevo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={style}>
      {view === 'home' && (
        <HomeView config={config} onNavigate={setView} />
      )}
      {view === 'qr' && <QrView config={config} guestUrl={guestUrl} onBack={() => setView('home')} />}
      {view === 'upload' && (
        <UploadView
          config={config}
          status={status}
          uploading={uploading}
          onFile={handleFile}
          onBack={() => setView('home')}
        />
      )}
      {view === 'display' && <DisplayView config={config} onBack={() => setView('home')} />}
    </div>
  )
}

function HomeView({ config, onNavigate }: { config: EventConfig; onNavigate: (v: View) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '2rem', padding: '2rem' }}>
      {config.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.logoUrl} alt="" style={{ maxWidth: 160, maxHeight: 120, objectFit: 'contain' }} />
      )}
      <h1
        style={{
          fontFamily: config.fonts.display,
          color: 'var(--primary)',
          textAlign: 'center',
          ...textEffectStyle(config.titleEffect, config.colors.primary),
        }}
        dangerouslySetInnerHTML={{ __html: config.eventName }}
      />
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => onNavigate('display')}>▶ Pantalla</button>
        <button onClick={() => onNavigate('qr')}>QR Invitados</button>
        <button onClick={() => onNavigate('upload')}>📷 Subir foto</button>
      </div>
    </div>
  )
}

function QrView({ config, guestUrl, onBack }: { config: EventConfig; guestUrl: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.6rem', padding: '2rem' }}>
      <h2 style={{ fontFamily: config.fonts.display }}>QR para invitados</h2>
      <QrCode value={guestUrl} color={config.qrColor} />
      <p style={{ textAlign: 'center', maxWidth: 320 }} dangerouslySetInnerHTML={{ __html: config.texts.qrSubtitle }} />
      <p style={{ wordBreak: 'break-all', fontSize: '0.75rem', opacity: 0.6 }}>{guestUrl}</p>
      <button onClick={onBack}>← Volver</button>
    </div>
  )
}

function UploadView({
  config,
  status,
  uploading,
  onFile,
  onBack,
}: {
  config: EventConfig
  status: string
  uploading: boolean
  onFile: (file: File) => void
  onBack: () => void
}) {
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
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <p role="status">{status}</p>
      <button onClick={onBack}>← Volver</button>
    </div>
  )
}

function DisplayView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [photos, setPhotos] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let cancelled = false
    let slideTimer: ReturnType<typeof setInterval> | undefined
    let pauseTimer: ReturnType<typeof setTimeout> | undefined

    async function loadAndLoop() {
      const urls = await fetchPhotos(config.cloudinaryFolder)
      if (cancelled) return
      setPhotos(urls)
      setIndex(0)
      setPaused(false)

      if (urls.length === 0) {
        pauseTimer = setTimeout(loadAndLoop, config.slideshow.pauseMs)
        return
      }

      slideTimer = setInterval(() => {
        setIndex((i) => {
          if (i + 1 < urls.length) return i + 1
          clearInterval(slideTimer)
          setPaused(true)
          pauseTimer = setTimeout(loadAndLoop, config.slideshow.pauseMs)
          return i
        })
      }, config.slideshow.slideMs)
    }

    loadAndLoop()
    return () => {
      cancelled = true
      if (slideTimer) clearInterval(slideTimer)
      if (pauseTimer) clearTimeout(pauseTimer)
    }
  }, [config.cloudinaryFolder, config.slideshow.slideMs, config.slideshow.pauseMs])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {photos[index] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photos[index]} alt="" style={{ maxWidth: '70vw', maxHeight: '72vh', objectFit: 'contain', borderRadius: 8 }} />
      )}
      {photos.length === 0 && <p>Esperando las primeras fotos…</p>}
      <div style={{ position: 'fixed', bottom: '3vh', left: 0, right: 0, textAlign: 'center' }}>
        <p style={{ fontFamily: config.fonts.display, color: 'var(--primary)' }} dangerouslySetInnerHTML={{ __html: config.texts.footerText }} />
      </div>
      {paused && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem' }}>Actualizando fotos…</div>
      )}
      {config.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.logoUrl}
          alt=""
          style={{ position: 'fixed', bottom: '1.5vh', right: '1.5vw', maxWidth: 100, maxHeight: 80, objectFit: 'contain' }}
        />
      )}
      <button style={{ position: 'fixed', top: '1rem', left: '1rem' }} onClick={onBack}>
        ← Volver
      </button>
    </div>
  )
}
