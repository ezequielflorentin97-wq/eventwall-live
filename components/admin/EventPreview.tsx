'use client'
import { QrCode } from '../event-app/QrCode'
import { textEffectStyle } from '../../lib/textEffects'

type PreviewProps = {
  eventName: string
  colors: { bg: string; primary: string; dark: string; text: string; uploadBg: string }
  fontDisplay: string
  fontBody: string
  qrColor: string
  titleEffect: string
}

// A mock of the home + QR views using the wizard's current form state — not
// the real EventApp (that fetches photos from Cloudinary), just enough to
// judge the palette/typography/effect choice before saving.
export function EventPreview({ eventName, colors, fontDisplay, fontBody, qrColor, titleEffect }: PreviewProps) {
  return (
    <div
      style={{
        background: colors.bg,
        color: colors.text,
        fontFamily: fontBody,
        borderRadius: 12,
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem',
        border: '1px solid #ddd',
      }}
    >
      <p
        style={{
          fontFamily: fontDisplay,
          color: colors.primary,
          fontSize: '1.6rem',
          textAlign: 'center',
          margin: 0,
          whiteSpace: 'pre-line',
          ...textEffectStyle(titleEffect, colors.primary),
        }}
      >
        {eventName || 'Nombre del evento'}
      </p>
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <span style={{ border: `1px solid ${colors.primary}`, color: colors.primary, padding: '0.4rem 0.9rem', borderRadius: 4, fontSize: '0.8rem' }}>
          ▶ Pantalla
        </span>
        <span style={{ border: `1px solid ${colors.primary}`, color: colors.primary, padding: '0.4rem 0.9rem', borderRadius: 4, fontSize: '0.8rem' }}>
          QR Invitados
        </span>
      </div>
      <QrCode value="https://ejemplo.com/e/preview" color={qrColor} size={120} />
      <div style={{ background: colors.uploadBg, width: '100%', borderRadius: 8, padding: '0.8rem', textAlign: 'center' }}>
        <span style={{ fontFamily: fontDisplay, color: colors.dark, fontSize: '0.85rem' }}>Vista &quot;Subir foto&quot;</span>
      </div>
    </div>
  )
}
