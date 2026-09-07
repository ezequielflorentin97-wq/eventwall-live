'use client'
import { useState } from 'react'

// Same unsigned-upload Cloudinary accounts as guest photos, but a fixed
// "eventwall-branding" folder — logos are uploaded before the event has a
// final slug (that's only generated when the wizard is submitted).
const CLOUDS = [
  { name: 'dberfji8v', preset: 'kiara_preset' },
  { name: 'dtoq7eqee', preset: 'kiara_preset' },
]

async function uploadLogo(file: File): Promise<string> {
  let lastError: unknown = null
  for (const cloud of CLOUDS) {
    const form = new FormData()
    form.append('file', file)
    form.append('upload_preset', cloud.preset)
    form.append('folder', 'eventwall-branding')
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.name}/image/upload`, { method: 'POST', body: form })
      if (res.ok) {
        const body = await res.json()
        return body.secure_url as string
      }
      lastError = await res.text()
    } catch (err) {
      lastError = err
    }
  }
  throw new Error(`No se pudo subir el logo: ${String(lastError)}`)
}

export function LogoUploader({ value, onChange }: { value: string | undefined; onChange: (url: string | undefined) => void }) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')

  async function handleFile(file: File) {
    setStatus('uploading')
    try {
      const url = await uploadLogo(file)
      onChange(url)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
      Logo del evento/empresa (opcional)
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Logo actual" style={{ width: 56, height: 56, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #ddd' }} />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={status === 'uploading'}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {value && (
          <button type="button" onClick={() => onChange(undefined)} style={{ fontSize: '0.75rem' }}>
            Quitar
          </button>
        )}
      </div>
      {status === 'uploading' && <span style={{ color: '#888' }}>Subiendo…</span>}
      {status === 'error' && <span style={{ color: 'crimson' }}>No se pudo subir el logo, probá de nuevo.</span>}
    </label>
  )
}
