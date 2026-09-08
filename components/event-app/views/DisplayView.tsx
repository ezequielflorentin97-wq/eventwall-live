'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { fetchPhotoEntries, type PhotoEntry } from '../useCloudinary'
import { castVote, fetchVotes, hasVoted } from '../useVotes'
import styles from '../EventApp.module.css'

export function DisplayView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let cancelled = false
    let slideTimer: ReturnType<typeof setInterval> | undefined
    let pauseTimer: ReturnType<typeof setTimeout> | undefined

    async function loadAndLoop() {
      const [entries, voteMap] = await Promise.all([fetchPhotoEntries(config.cloudinaryFolder), fetchVotes(config.cloudinaryFolder)])
      if (cancelled) return
      setPhotos(entries)
      setVotes(voteMap)
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
  const alreadyVoted = current ? hasVoted(config.cloudinaryFolder, current.publicId) : false

  async function handleVote() {
    if (!current || alreadyVoted) return
    const newCount = await castVote(config.cloudinaryFolder, current.publicId)
    setVotes((v) => ({ ...v, [current.publicId]: newCount }))
  }

  return (
    <div className={styles.stage}>
      {current && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={current.publicId} src={current.url} alt="" className={styles.photo} />
          <button className={styles.voteBtn} onClick={handleVote} disabled={alreadyVoted}>
            {alreadyVoted ? '❤️' : '🤍'} {votes[current.publicId] ?? 0}
          </button>
        </>
      )}
      {photos.length === 0 && <p className={styles.helperText}>Esperando las primeras fotos…</p>}
      <div className={styles.stageFooter}>
        <p className={styles.stageFooterText} style={{ fontFamily: config.fonts.display, color: 'var(--primary)' }} dangerouslySetInnerHTML={{ __html: config.texts.footerText }} />
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
