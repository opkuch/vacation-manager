import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/** Walks up from `startDir` until it finds the monorepo root marker. */
export function findMonorepoRoot(startDir: string = process.cwd()): string {
  let dir = resolve(startDir)
  while (true) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = dirname(dir)
    if (parent === dir) {
      throw new Error('Could not find monorepo root (pnpm-workspace.yaml)')
    }
    dir = parent
  }
}

/**
 * Loads `.env` then `.env.local` from the repo root. pnpm runs API scripts with
 * cwd `apps/api`, so commoneventframework's cwd-relative loadEnv misses the root
 * `.env` that docker-compose also uses.
 */
export function loadAppEnv(): void {
  const root = findMonorepoRoot()
  const dotenv = require('dotenv') as { config: (options: { path: string; override?: boolean }) => void }
  dotenv.config({ path: resolve(root, '.env') })
  dotenv.config({ path: resolve(root, '.env.local'), override: true })
}
