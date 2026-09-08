'use client'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '../../lib/supabaseBrowser'

export function SupabaseLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    // A full navigation (not router.push) so the very next request carries
    // the freshly-set session cookies straight to the middleware — a
    // client-side/RSC navigation right after signing in can race ahead of
    // the cookie write and bounce back to /admin/login with no error shown.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/admin'
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <button type="submit">Ingresar</button>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </form>
  )
}
