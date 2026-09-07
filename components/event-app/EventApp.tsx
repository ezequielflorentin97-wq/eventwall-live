'use client'
import { useState, type CSSProperties } from 'react'
import type { EventConfig } from '../../lib/config'
import type { View } from './viewTypes'
import { HomeView } from './views/HomeView'
import { QrView } from './views/QrView'
import { UploadView } from './views/UploadView'
import { DisplayView } from './views/DisplayView'
import { RankingView } from './views/RankingView'
import { GuestbookView } from './views/GuestbookView'

export function EventApp({
  config,
  guestUrl,
  initialView = 'home',
}: {
  config: EventConfig
  guestUrl: string
  initialView?: View
}) {
  const [view, setView] = useState<View>(initialView)

  const style = {
    '--bg': config.colors.bg,
    '--primary': config.colors.primary,
    '--dark': config.colors.dark,
    '--text': config.colors.text,
    '--upload-bg': config.colors.uploadBg,
    background: 'var(--bg)',
    color: 'var(--text)',
    minHeight: '100vh',
    fontFamily: config.fonts.body,
  } as CSSProperties

  const goHome = () => setView('home')

  return (
    <div style={style}>
      {view === 'home' && <HomeView config={config} onNavigate={setView} />}
      {view === 'qr' && <QrView config={config} guestUrl={guestUrl} onBack={goHome} />}
      {view === 'upload' && <UploadView config={config} onBack={goHome} />}
      {view === 'display' && <DisplayView config={config} onBack={goHome} />}
      {view === 'ranking' && <RankingView config={config} onBack={goHome} />}
      {view === 'guestbook' && <GuestbookView config={config} onBack={goHome} />}
    </div>
  )
}
