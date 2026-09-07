'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LOCAL_SESSION_COOKIE } from '../../../lib/localSessionCookie'

export async function localLogin(_prevState: { error: string } | null, formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const expected = process.env.LOCAL_ADMIN_PASSWORD

  if (!expected) {
    return { error: 'LOCAL_ADMIN_PASSWORD no está configurado en .env.local' }
  }
  if (password !== expected) {
    return { error: 'Contraseña incorrecta' }
  }

  const store = await cookies()
  store.set(LOCAL_SESSION_COOKIE, '1', { httpOnly: true, sameSite: 'lax', path: '/' })
  redirect('/admin')
}
