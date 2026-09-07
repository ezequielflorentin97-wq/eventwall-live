export function isWithinLimit(timestamps: number[], now: number, max: number, windowMs: number): boolean {
  const recent = timestamps.filter((t) => now - t < windowMs)
  return recent.length < max
}
