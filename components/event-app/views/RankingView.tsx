'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { fetchPhotoEntries, type PhotoEntry } from '../useCloudinary'
import { fetchVotes } from '../useVotes'
import styles from '../EventApp.module.css'

export function RankingView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [ranked, setRanked] = useState<(PhotoEntry & { votes: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchPhotoEntries(config.cloudinaryFolder), fetchVotes(config.cloudinaryFolder)]).then(([entries, votes]) => {
      if (cancelled) return
      const withVotes = entries.map((e) => ({ ...e, votes: votes[e.publicId] ?? 0 }))
      withVotes.sort((a, b) => b.votes - a.votes)
      setRanked(withVotes.slice(0, 5))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [config.cloudinaryFolder])

  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Volver
      </button>
      <h2 className={styles.title} style={{ fontFamily: config.fonts.display, color: 'var(--primary)', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)' }}>
        🏆 Top 5 fotos
      </h2>
      {loading && <p className={styles.helperText}>Cargando…</p>}
      {!loading && ranked.length === 0 && <p className={styles.helperText}>Todavía no hay votos.</p>}
      <div className={styles.rankGrid}>
        {ranked.map((photo, i) => (
          <div key={photo.publicId} className={styles.rankCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" className={styles.rankImg} />
            <p className={styles.rankLabel}>
              #{i + 1} — ❤️ {photo.votes}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
