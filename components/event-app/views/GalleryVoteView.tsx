'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { fetchPhotoEntries, type PhotoEntry } from '../useCloudinary'
import { castVote, fetchVotes, hasVoted } from '../useVotes'
import { sortByVotes } from '../../../lib/sortByVotes'
import styles from '../EventApp.module.css'

type RankedPhoto = PhotoEntry & { votes: number }

export function GalleryVoteView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [ranked, setRanked] = useState<RankedPhoto[]>([])
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchPhotoEntries(config.cloudinaryFolder), fetchVotes(config.cloudinaryFolder)]).then(([entries, votes]) => {
      if (cancelled) return
      const withVotes = entries.map((e) => ({ ...e, votes: votes[e.publicId] ?? 0 }))
      setRanked(sortByVotes(withVotes))
      setVotedIds(new Set(entries.filter((e) => hasVoted(config.cloudinaryFolder, e.publicId)).map((e) => e.publicId)))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [config.cloudinaryFolder])

  async function handleVote(photoId: string) {
    if (votedIds.has(photoId)) return
    const newCount = await castVote(config.cloudinaryFolder, photoId)
    setRanked((prev) => sortByVotes(prev.map((p) => (p.publicId === photoId ? { ...p, votes: newCount } : p))))
    setVotedIds((prev) => new Set(prev).add(photoId))
  }

  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Volver
      </button>
      <h2
        className={styles.title}
        style={{ fontFamily: config.fonts.display, color: 'var(--primary)', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)' }}
      >
        ❤️ Me gusta
      </h2>
      {loading && <p className={styles.helperText}>Cargando…</p>}
      {!loading && ranked.length === 0 && <p className={styles.helperText}>Todavía no hay fotos.</p>}
      <div className={styles.rankGrid}>
        {ranked.map((photo) => {
          const voted = votedIds.has(photo.publicId)
          return (
            <div key={photo.publicId} className={styles.rankCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className={styles.rankImg} />
              <button className={styles.rankVoteBtn} onClick={() => handleVote(photo.publicId)} disabled={voted}>
                {voted ? '❤️' : '🤍'} {photo.votes}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
