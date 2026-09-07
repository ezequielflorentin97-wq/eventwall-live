// The 2 free Cloudinary accounts shared by every event (dual-fallback on
// upload, merged on read). Used from both client upload code and the
// server-side analytics fetcher — kept in one place instead of duplicated.
export const CLOUDINARY_CLOUDS = [
  { name: 'dberfji8v', preset: 'kiara_preset' },
  { name: 'dtoq7eqee', preset: 'kiara_preset' },
] as const
