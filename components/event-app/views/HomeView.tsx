import type { EventConfig } from '../../../lib/config'
import { textEffectStyle } from '../../../lib/textEffects'
import type { View } from '../viewTypes'

export function HomeView({ config, onNavigate }: { config: EventConfig; onNavigate: (v: View) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '2rem', padding: '2rem' }}>
      {config.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={config.logoUrl} alt="" style={{ maxWidth: 160, maxHeight: 120, objectFit: 'contain' }} />
      )}
      <h1
        style={{
          fontFamily: config.fonts.display,
          color: 'var(--primary)',
          textAlign: 'center',
          ...textEffectStyle(config.titleEffect, config.colors.primary),
        }}
        dangerouslySetInnerHTML={{ __html: config.eventName }}
      />
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => onNavigate('display')}>▶ Pantalla</button>
        <button onClick={() => onNavigate('qr')}>QR Invitados</button>
        <button onClick={() => onNavigate('upload')}>📷 Subir foto</button>
        <button onClick={() => onNavigate('ranking')}>🏆 Ranking</button>
        <button onClick={() => onNavigate('guestbook')}>🎤 Dejar un mensaje</button>
      </div>
    </div>
  )
}
