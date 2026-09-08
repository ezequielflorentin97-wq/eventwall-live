import type { EventConfig } from '../../../lib/config'
import { textEffectStyle } from '../../../lib/textEffects'
import type { View } from '../viewTypes'
import styles from '../EventApp.module.css'

export function HomeView({ config, onNavigate }: { config: EventConfig; onNavigate: (v: View) => void }) {
  return (
    <div className={styles.screen}>
      {config.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.logoUrl} alt="" className={styles.logo} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem' }}>
        <h1
          className={styles.title}
          style={{ fontFamily: config.fonts.display, color: 'var(--primary)', ...textEffectStyle(config.titleEffect, config.colors.primary) }}
          dangerouslySetInnerHTML={{ __html: config.eventName }}
        />
        <div className={styles.rule} />
        <p className={styles.eyebrow}>Recuerdos en vivo</p>
      </div>
      <div className={styles.btnGrid}>
        <button className={styles.btnSolid} onClick={() => onNavigate('display')}>
          ▶ Pantalla
        </button>
        <button className={styles.btn} onClick={() => onNavigate('qr')}>
          QR invitados
        </button>
        <button className={styles.btn} onClick={() => onNavigate('upload')}>
          📷 Subir foto
        </button>
        <button className={styles.btnGhost} onClick={() => onNavigate('ranking')}>
          🏆 Ranking
        </button>
      </div>
    </div>
  )
}
