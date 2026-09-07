// Lets the whole app run against a local JSON file + a plain password
// instead of Supabase/Mercado Pago, purely so it can be clicked through for
// QA without any real account. Never used unless explicitly opted into or
// Supabase is unconfigured — production always sets a real Supabase URL.
export function isLocalMode(): boolean {
  if (process.env.LOCAL_MODE === 'true') return true
  if (process.env.LOCAL_MODE === 'false') return false
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !url || url.includes('placeholder')
}
