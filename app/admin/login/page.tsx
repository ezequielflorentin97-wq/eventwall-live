import { isLocalMode } from '../../../lib/localMode'
import { LocalLoginForm } from '../../../components/admin/LocalLoginForm'
import { SupabaseLoginForm } from '../../../components/admin/SupabaseLoginForm'

export default function AdminLogin() {
  return (
    <main style={{ maxWidth: 360, margin: '4rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Admin — EventWall Live</h1>
      {isLocalMode() ? <LocalLoginForm /> : <SupabaseLoginForm />}
    </main>
  )
}
