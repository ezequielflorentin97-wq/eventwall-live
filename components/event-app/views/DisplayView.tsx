'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { fetchPhotoEntries, type PhotoEntry } from '../useCloudinary'
import { GalleryVoteView } from './GalleryVoteView'
import { buildSlides, type Slide } from '../../../lib/buildSlides'
import styles from '../EventApp.module.css'

// A "vote for the best photo" slide is interleaved after every N photos.
const PROMO_EVERY = 5

export function DisplayView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [slides, setSlides] = useState<Slide<PhotoEntry>[]>([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showRanking, setShowRanking] = useState(false)

  useEffect(() => {
    let cancelled = false
    let slideTimer: ReturnType<typeof setInterval> | undefined
    let pauseTimer: ReturnType<typeof setTimeout> | undefined

    async function loadAndLoop() {
      const entries = await fetchPhotoEntries(config.cloudinaryFolder)
      if (cancelled) return
      const built = buildSlides(entries, PROMO_EVERY)
      setSlides(built)
      setIndex(0)
      setPaused(false)

      if (built.length === 0) {
        pauseTimer = setTimeout(loadAndLoop, config.slideshow.pauseMs)
        return
      }

      slideTimer = setInterval(() => {
        setIndex((i) => {
          if (i + 1 < built.length) return i + 1
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

  const current = slides[index]

  if (showRanking) {
    return <GalleryVoteView config={config} onBack={() => setShowRanking(false)} />
  }

  return (
    <div className={styles.stage}>
      <p className={styles.brandWatermark}>Recuerdos en vivo</p>
      {current?.kind === 'photo' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={current.photo.publicId} src={current.photo.url} alt="" className={styles.photo} />
      )}
      {current?.kind === 'promo' && (
        <div key={`promo-${index}`} className={styles.promoSlide}>
          <p className={styles.promoTitle} style={{ fontFamily: config.fonts.display, color: 'var(--primary)' }}>
            ¡Votá la mejor foto!
          </p>
          <p className={styles.promoLine}>Escaneá el QR de tu mesa y tocá ❤️ Me gusta</p>
          <p className={styles.promoPrize}>🏆 La foto más votada se gana un premio</p>
        </div>
      )}
      {slides.length === 0 && <p className={styles.helperText}>Esperando las primeras fotos…</p>}
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
      <button className={styles.rankingCornerBtn} onClick={() => setShowRanking(true)}>
        🏆 Ranking
      </button>
    </div>
  )
}
