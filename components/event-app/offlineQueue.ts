'use client'

// Minimal IndexedDB-backed queue so a photo survives a dropped connection:
// if the direct upload fails, the compressed blob is stored locally and
// retried automatically once the browser reports it's back online (or on
// the next visit to the upload view). No library — just enough IndexedDB
// to store/list/delete a handful of blobs per event.
const DB_NAME = 'eventwall-offline-queue'
const STORE = 'photos'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export type QueuedPhoto = { id: number; folder: string; blob: Blob; queuedAt: number }

export async function queuePhoto(folder: string, blob: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add({ folder, blob, queuedAt: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function listQueued(folder: string): Promise<QueuedPhoto[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as QueuedPhoto[]).filter((p) => p.folder === folder))
    req.onerror = () => reject(req.error)
  })
}

export async function removeQueued(id: number): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
