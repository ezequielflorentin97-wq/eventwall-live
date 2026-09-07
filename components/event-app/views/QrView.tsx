import type { EventConfig } from '../../../lib/config'
import { QrCode } from '../QrCode'

export function QrView({ config, guestUrl, onBack }: { config: EventConfig; guestUrl: string; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.6rem', padding: '2rem' }}>
      <h2 style={{ fontFamily: config.fonts.display }}>QR para invitados</h2>
      <QrCode value={guestUrl} color={config.qrColor} />
      <p style={{ textAlign: 'center', maxWidth: 320 }} dangerouslySetInnerHTML={{ __html: config.texts.qrSubtitle }} />
      <p style={{ wordBreak: 'break-all', fontSize: '0.75rem', opacity: 0.6 }}>{guestUrl}</p>
      <button onClick={onBack}>← Volver</button>
    </div>
  )
}
