import 'server-only'

// Deletes every photo under an event's folder using Cloudinary's Admin API
// (authenticated — API key + secret, never the client-side unsigned preset
// used for guest uploads). Requires a single production Cloudinary account;
// see README "Storage" for why we're moving off the 2-account free dual
// setup once real volume shows up.
//
// Blocked until CLOUDINARY_ADMIN_CLOUD_NAME / CLOUDINARY_API_KEY /
// CLOUDINARY_API_SECRET are set — throws a clear error rather than
// silently doing nothing, so the cron route can report it instead of
// pretending the delete happened.
export async function deleteFolderPhotos(folder: string): Promise<{ deleted: number }> {
  const cloudName = process.env.CLOUDINARY_ADMIN_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'CLOUDINARY_ADMIN_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET no configurados — no se puede borrar en Cloudinary todavía.'
    )
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?prefix=${encodeURIComponent(folder)}`,
    { method: 'DELETE', headers: { Authorization: `Basic ${auth}` } }
  )

  if (!res.ok) {
    throw new Error(`Cloudinary Admin API respondió ${res.status}: ${await res.text()}`)
  }

  const body = (await res.json()) as { deleted?: Record<string, string> }
  return { deleted: Object.keys(body.deleted ?? {}).length }
}
