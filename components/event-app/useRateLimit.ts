'use client'
import { isWithinLimit } from '../../lib/rateLimit'

const STORAGE_KEY = 'ew_uploads'

function readTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function checkRateLimit(max: number, windowMs: number): boolean {
  return isWithinLimit(readTimestamps(), Date.now(), max, windowMs)
}

export function registerUpload(): void {
  const timestamps = readTimestamps()
  timestamps.push(Date.now())
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps))
}
