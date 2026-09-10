'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { fetchPhotoEntries, type PhotoEntry } from '../useCloudinary'
import styles from '../EventApp.module.css'

export function DisplayView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let cancelled = false
    let slideTimer: ReturnType<typeof setInterval> | undefined
    let pauseTimer: ReturnType<typeof setTimeout> | undefined

    async function loadAndLoop() {
      const entries = await fetchPhotoEntries(config.cloudinaryFolder)
      if (cancelled) return
      setPhotos(entries)
      setIndex(0)
      setPaused(false)

      if (entries.length === 0) {
        pauseTimer = setTimeout(loadAndLoop, config.slideshow.pauseMs)
        return
      }

      slideTimer = setInterval(() => {
        setIndex((i) => {
          if (i + 1 < entries.length) return i + 1
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

  const current = photos[index]

  return (
    <div className={styles.stage}>
      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={current.publicId} src={current.url} alt="" className={styles.photo} />
      )}
      {photos.length === 0 && <p className={styles.helperText}>Esperando las primeras fotos…</p>}
      <div className={styles.stageFooter}>
        <p
          className={styles.stageFooterText}
          style={{ fontFamily: config.fonts.display, color: 'var(--primary)' }}
          dangerouslySetInnerHTML={{ __html: config.texts.footerText }}
        />
        <p className={styles.voteHint}>¡Votá la mejor foto desde ❤️ Me gusta en tu celular!</p>
      </div>
      {paused && <div className={styles.refreshBadge}>Actualizando fotos…</div>}
      {config.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.logoUrl} alt="" className={styles.stageLogo} />
      )}
      <button className={styles.backBtn} onClick={onBack}>
        ← Volver
      </button>
    </div>
  )
}
