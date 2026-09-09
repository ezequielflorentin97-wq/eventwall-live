'use client'
import { useState } from 'react'
import { emptyEventPhotos } from '../../app/admin/actions'
import styles from './AdminUI.module.css'

export function EmptyPhotosButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleClick() {
    const ok = window.confirm(
      `¿Borrar todas las fotos de "${eventName}"?\n\nEsto no se puede deshacer. El evento y su link siguen existiendo, solo se vacían las fotos.`
    )
    if (!ok) return

    setStatus('working')
    setMessage('')
    try {
      const result = await emptyEventPhotos(eventId)
      const errors = result.perAccount.filter((a) => a.error)
      if (errors.length > 0) {
        setStatus('error')
        setMessage(`Borradas ${result.totalDeleted}, pero falló en: ${errors.map((e) => `${e.cloud} (${e.error})`).join('; ')}`)
      } else {
        setStatus('done')
        setMessage(`${result.totalDeleted} foto(s) borrada(s).`)
      }
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'No se pudo borrar')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <button type="button" onClick={handleClick} disabled={status === 'working'} className={styles.actionBtn}>
        {status === 'working' ? 'Borrando…' : '🗑️ Vaciar fotos'}
      </button>
      {message && (
        <span style={{ fontSize: '0.72rem', color: status === 'error' ? '#c0392b' : '#1f7a4d' }}>{message}</span>
      )}
    </div>
  )
}
