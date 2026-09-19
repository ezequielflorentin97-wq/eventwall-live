'use client'
import { useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { QrCode } from '../QrCode'
import styles from '../EventApp.module.css'

export function QrView({ config, guestUrl, onBack }: { config: EventConfig; guestUrl: string; onBack: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Volver
      </button>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Escaneá para compartir</p>
        <div className={styles.qrFrame}>
          <QrCode value={guestUrl} color={config.qrColor} size={480} onReady={setQrDataUrl} />
        </div>
        <p className={styles.helperText} dangerouslySetInnerHTML={{ __html: config.texts.qrSubtitle }} />
        <p className={styles.mutedText}>{guestUrl}</p>
        {qrDataUrl && (
          <a href={qrDataUrl} download="qr-invitados.png" className={styles.btn}>
            ⬇ Descargar QR
          </a>
        )}
      </div>
      <p className={styles.brandWatermark}>Recuerdos en vivo</p>
    </div>
  )
}
