import type { EventConfig } from '../../../lib/config'
import { QrCode } from '../QrCode'
import styles from '../EventApp.module.css'

export function QrView({ config, guestUrl, onBack }: { config: EventConfig; guestUrl: string; onBack: () => void }) {
  return (
    <div className={styles.screen}>
      <button className={styles.backBtn} onClick={onBack}>
        ← Volver
      </button>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Escaneá para compartir</p>
        <div className={styles.qrFrame}>
          <QrCode value={guestUrl} color={config.qrColor} />
        </div>
        <p className={styles.helperText} dangerouslySetInnerHTML={{ __html: config.texts.qrSubtitle }} />
        <p className={styles.mutedText}>{guestUrl}</p>
      </div>
    </div>
  )
}
