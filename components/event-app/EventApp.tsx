'use client'
import { useState, type CSSProperties } from 'react'
import type { EventConfig } from '../../lib/config'
import type { View } from './viewTypes'
import { HomeView } from './views/HomeView'
import { HostHomeView } from './views/HostHomeView'
import { QrView } from './views/QrView'
import { UploadView } from './views/UploadView'
import { DisplayView } from './views/DisplayView'
import { GalleryVoteView } from './views/GalleryVoteView'

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
  // 'qr' and 'display' are only ever reached from HostHomeView — their
  // back button must return there, not to the guest home.
  const goHostHome = () => setView('hostHome')

  return (
    <div style={style}>
      {view === 'home' && <HomeView config={config} onNavigate={setView} />}
      {view === 'hostHome' && <HostHomeView config={config} onNavigate={setView} />}
      {view === 'qr' && <QrView config={config} guestUrl={guestUrl} onBack={goHostHome} />}
      {view === 'upload' && <UploadView config={config} onBack={goHome} onNavigate={setView} />}
      {view === 'display' && <DisplayView config={config} onBack={goHostHome} />}
      {view === 'gallery' && <GalleryVoteView config={config} onBack={goHome} />}
    </div>
  )
}
