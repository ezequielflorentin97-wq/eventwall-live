import 'server-only'

// The 2 legacy free Cloudinary accounts (see lib/cloudinaryClouds.ts). The
// unsigned upload preset guests use can't delete or report usage — that
// needs the Admin API (API key + secret from each account's dashboard,
// under Settings → Access Keys). Each account gets its own optional
// credential pair since we haven't consolidated to one paid account yet.
const ADMIN_CLOUDS = [
  { name: 'dberfji8v', apiKey: process.env.CLOUDINARY_DBERFJI8V_API_KEY, apiSecret: process.env.CLOUDINARY_DBERFJI8V_API_SECRET },
  { name: 'dtoq7eqee', apiKey: process.env.CLOUDINARY_DTOQ7EQEE_API_KEY, apiSecret: process.env.CLOUDINARY_DTOQ7EQEE_API_SECRET },
] as const

function configuredClouds() {
  return ADMIN_CLOUDS.filter((c) => c.apiKey && c.apiSecret)
}

function authHeader(apiKey: string, apiSecret: string) {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
}

export type DeleteFolderResult = {
  totalDeleted: number
  perAccount: { cloud: string; deleted?: number; error?: string }[]
  skipped: string[]
}

// Tries every account that has Admin API credentials configured (a folder's
// photos can be split across both, since upload falls back from the
// primary account to the secondary on error) and reports per-account
// results instead of stopping at the first success/failure.
export async function deleteFolderPhotos(folder: string): Promise<DeleteFolderResult> {
  const clouds = configuredClouds()
  const skipped = ADMIN_CLOUDS.filter((c) => !c.apiKey || !c.apiSecret).map((c) => c.name)

  if (clouds.length === 0) {
    throw new Error(
      'No hay credenciales de Admin API configuradas para ninguna cuenta de Cloudinary (CLOUDINARY_DBERFJI8V_API_KEY/SECRET, CLOUDINARY_DTOQ7EQEE_API_KEY/SECRET) — no se puede borrar todavía.'
    )
  }

  const perAccount: DeleteFolderResult['perAccount'] = []
  let totalDeleted = 0

  for (const cloud of clouds) {
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud.name}/resources/image/upload?prefix=${encodeURIComponent(folder)}`,
        { method: 'DELETE', headers: { Authorization: authHeader(cloud.apiKey!, cloud.apiSecret!) } }
      )
      if (!res.ok) {
        perAccount.push({ cloud: cloud.name, error: `HTTP ${res.status}: ${await res.text()}` })
        continue
      }
      const body = (await res.json()) as { deleted?: Record<string, string> }
      const deleted = Object.keys(body.deleted ?? {}).length
      perAccount.push({ cloud: cloud.name, deleted })
      totalDeleted += deleted
    } catch (err) {
      perAccount.push({ cloud: cloud.name, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return { totalDeleted, perAccount, skipped }
}

export type CloudUsage = {
  cloud: string
  plan: string
  credits: { used: number; limit: number | null }
  storageBytes: number
  transformations: number
  requests: number
}

export type UsageReport = {
  accounts: CloudUsage[]
  skipped: string[]
}

// Cloudinary's free tier is measured in "credits" (storage + transformations
// + bandwidth combined) rather than a flat GB number — this surfaces the
// same number Cloudinary's own dashboard shows, so "¿estamos OK de
// almacenamiento?" has a real answer instead of a guess.
export async function fetchStorageUsage(): Promise<UsageReport> {
  const clouds = configuredClouds()
  const skipped = ADMIN_CLOUDS.filter((c) => !c.apiKey || !c.apiSecret).map((c) => c.name)

  const accounts: CloudUsage[] = []
  for (const cloud of clouds) {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud.name}/usage`, {
      headers: { Authorization: authHeader(cloud.apiKey!, cloud.apiSecret!) },
    })
    if (!res.ok) {
      throw new Error(`Cloudinary Admin API (usage, ${cloud.name}) respondió ${res.status}: ${await res.text()}`)
    }
    const body = await res.json()
    accounts.push({
      cloud: cloud.name,
      plan: body.plan ?? 'unknown',
      credits: {
        used: body.credits?.usage ?? 0,
        limit: body.credits?.limit ?? null,
      },
      storageBytes: body.storage?.usage ?? 0,
      transformations: body.transformations?.usage ?? 0,
      requests: body.requests ?? 0,
    })
  }

  return { accounts, skipped }
}
