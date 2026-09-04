import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: { environment: 'node' },
  resolve: {
    // The `server-only` guard package throws when imported outside Next's
    // server bundler condition, which Vitest doesn't set. Point it at a
    // no-op stub so unit tests can still import server-side lib modules.
    alias: {
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
})
