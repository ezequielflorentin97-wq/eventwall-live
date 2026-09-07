// Free, client-side canvas filters — the substitute for a paid AI filter
// API: same "make my photo look nicer" value for the guest, zero cost per
// upload. See components/event-app/photoFilters.ts for the actual pixel work.
export const PHOTO_FILTERS = [
  { id: 'ninguno', label: 'Ninguno' },
  { id: 'byn', label: 'Blanco y negro' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'vineta', label: 'Viñeta' },
] as const

export type PhotoFilterId = (typeof PHOTO_FILTERS)[number]['id']
