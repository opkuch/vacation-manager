import { loadAppEnv } from '../config/loadAppEnv'

// Load env before importing the DataSource, which reads DATABASE_URL on construction.
loadAppEnv()

async function run(): Promise<void> {
  const { AppDataSource } = await import('./data-source')
  await AppDataSource.initialize()
  try {
    const applied = await AppDataSource.runMigrations()
    console.log(`[db:migrate] Applied ${applied.length} migration(s).`)
  } finally {
    await AppDataSource.destroy()
  }
}

run().catch((err) => {
  console.error('[db:migrate] Failed:', err)
  process.exit(1)
})
