'use client'
import { useEffect, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { fetchPhotoEntries, type PhotoEntry } from '../useCloudinary'
import { fetchVotes } from '../useVotes'

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
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <h2 style={{ fontFamily: config.fonts.display, color: 'var(--primary)' }}>🏆 Top 5 fotos</h2>
      {loading && <p>Cargando…</p>}
      {!loading && ranked.length === 0 && <p>Todavía no hay votos.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', width: '100%', maxWidth: 700 }}>
        {ranked.map((photo, i) => (
          <div key={photo.publicId} style={{ textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} />
            <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
              #{i + 1} — ❤️ {photo.votes}
            </p>
          </div>
        ))}
      </div>
      <button onClick={onBack}>← Volver</button>
    </div>
  )
}
