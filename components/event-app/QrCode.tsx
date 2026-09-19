'use client'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrCode({ value, color, size = 220 }: { value: string; color: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: color, light: '#FFFFFF' },
    }).then((url) => {
      if (!cancelled) setDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [value, color, size])

  if (!dataUrl) {
    return <div style={{ width: size, height: size, background: '#fff', borderRadius: 8 }} />
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="Código QR" width={size} height={size} style={{ borderRadius: 8, background: '#fff', padding: 8 }} />
}
