'use client'
import { useActionState } from 'react'
import { localLogin } from '../../app/admin/login/actions'

export function LocalLoginForm() {
  const [state, formAction, pending] = useActionState(localLogin, null)

  return (
    <>
      <p style={{ fontSize: '0.8rem', color: '#888' }}>Modo local (QA) — sin Supabase.</p>
      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input type="password" name="password" placeholder="Contraseña local" required />
        <button type="submit" disabled={pending}>
          {pending ? 'Ingresando…' : 'Ingresar'}
        </button>
        {state?.error && <p style={{ color: 'crimson' }}>{state.error}</p>}
      </form>
    </>
  )
}
