'use client'
import { useEffect, useRef, useState } from 'react'
import type { EventConfig } from '../../../lib/config'
import { uploadVoiceMessage, fetchVoiceMessages } from '../useGuestbook'

const MAX_SECONDS = 20

export function GuestbookView({ config, onBack }: { config: EventConfig; onBack: () => void }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [status, setStatus] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchVoiceMessages(config.cloudinaryFolder).then(setMessages)
  }, [config.cloudinaryFolder])

  async function startRecording() {
    setStatus('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        handleStopped()
      }
      recorder.start()
      recorderRef.current = recorder
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            recorder.stop()
            if (timerRef.current) clearInterval(timerRef.current)
          }
          return s + 1
        })
      }, 1000)
    } catch {
      setStatus('No pudimos acceder al micrófono — revisá los permisos del navegador.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function handleStopped() {
    setRecording(false)
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    setStatus('Enviando tu mensaje…')
    try {
      await uploadVoiceMessage(blob, config.cloudinaryFolder)
      setStatus('¡Mensaje enviado!')
      setMessages(await fetchVoiceMessages(config.cloudinaryFolder))
    } catch {
      setStatus('No se pudo enviar el mensaje, probá de nuevo.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem' }}>
      <h2 style={{ fontFamily: config.fonts.display, color: 'var(--primary)', textAlign: 'center' }}>Dejá un mensaje de voz</h2>
      <p style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: 320 }}>Hasta {MAX_SECONDS} segundos — se suma al recuerdo del evento.</p>

      {!recording ? (
        <button onClick={startRecording}>🎤 Grabar mensaje</button>
      ) : (
        <button onClick={stopRecording}>⏹ Detener ({MAX_SECONDS - seconds}s)</button>
      )}

      <p role="status">{status}</p>

      {messages.length > 0 && (
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Mensajes de otros invitados:</p>
          {messages.map((url) => (
            <audio key={url} controls src={url} style={{ width: '100%' }} />
          ))}
        </div>
      )}

      <button onClick={onBack}>← Volver</button>
    </div>
  )
}
