export const RETENTION_DAYS = 30

export function computeExpiresAt(fromIso: string, days: number = RETENTION_DAYS): string {
  const from = new Date(fromIso)
  const expires = new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
  return expires.toISOString()
}

export function daysRemaining(expiresAtIso: string, nowIso: string = new Date().toISOString()): number {
  const ms = new Date(expiresAtIso).getTime() - new Date(nowIso).getTime()
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)))
}
