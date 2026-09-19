'use client'
import { useState } from 'react'
import QRCode from 'qrcode'
import styles from './AdminUI.module.css'

export function DownloadQrButton({ guestUrl, qrColor, fileName }: { guestUrl: string; qrColor: string; fileName: string }) {
  const [working, setWorking] = useState(false)

  async function handleClick() {
    setWorking(true)
    try {
      const dataUrl = await QRCode.toDataURL(guestUrl, {
        width: 800,
        margin: 1,
        color: { dark: qrColor, light: '#FFFFFF' },
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${fileName}.png`
      a.click()
    } finally {
      setWorking(false)
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={working} className={styles.actionBtn}>
      {working ? 'Generando…' : '⬇ Descargar QR'}
    </button>
  )
}
