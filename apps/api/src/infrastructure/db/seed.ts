import { randomUUID } from 'node:crypto'
import { loadEnv } from 'commoneventframework'
import { Role, VacationStatus, type DateOnly } from '@vm/shared'

// Load env before importing the DataSource, which reads DATABASE_URL on construction.
loadEnv()

const DEMO_PASSWORD = 'Password123!'

interface SeedUser {
  name: string
  email: string
  role: Role
}

const USERS: SeedUser[] = [
  { name: 'Maya Cohen', email: 'maya@vacation.local', role: Role.Validator },
  { name: 'Victor Stein', email: 'victor@vacation.local', role: Role.Validator },
  { name: 'Rachel Levi', email: 'rachel@vacation.local', role: Role.Requester },
  { name: 'Ron Adler', email: 'ron@vacation.local', role: Role.Requester },
  { name: 'Dana Klein', email: 'dana@vacation.local', role: Role.Requester },
]

/** Formats a date offset from today as a `YYYY-MM-DD` string. */
function dayOffset(days: number): DateOnly {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

interface SeedRequest {
  owner: string // email
  start: number // day offset from today
  end: number
  reason: string | null
  status: VacationStatus
  comments: string | null
}

// Covers every capability: all three statuses, optional/!optional reason,
// a required rejection comment, past (historical) and future ranges, and
// non-overlapping requests per user across several people for team planning.
const REQUESTS: SeedRequest[] = [
  { owner: 'rachel@vacation.local', start: 7, end: 11, reason: 'Family vacation', status: VacationStatus.Approved, comments: null },
  { owner: 'rachel@vacation.local', start: 30, end: 34, reason: 'Trip abroad', status: VacationStatus.Pending, comments: null },
  { owner: 'rachel@vacation.local', start: 20, end: 21, reason: 'Personal day', status: VacationStatus.Rejected, comments: 'Conflicts with the release week — please replan.' },
  { owner: 'ron@vacation.local', start: 14, end: 16, reason: 'Wedding', status: VacationStatus.Approved, comments: null },
  { owner: 'ron@vacation.local', start: 40, end: 45, reason: null, status: VacationStatus.Pending, comments: null },
  { owner: 'dana@vacation.local', start: 5, end: 6, reason: 'Medical appointment', status: VacationStatus.Pending, comments: null },
  { owner: 'dana@vacation.local', start: -10, end: -8, reason: 'Conference (completed)', status: VacationStatus.Approved, comments: null },
  { owner: 'dana@vacation.local', start: 50, end: 56, reason: 'Long summer break', status: VacationStatus.Rejected, comments: 'Team capacity is too low this sprint.' },
]

async function run(): Promise<void> {
  const { AppDataSource } = await import('./data-source')
  const { BcryptPasswordHasher } = await import('../auth/PasswordHasher')
  const { UserSchema } = await import('./entities/UserEntity')
  const { VacationRequestSchema } = await import('./entities/VacationRequestEntity')

  await AppDataSource.initialize()
  try {
    // Idempotent: wipe and reseed so the demo state is deterministic.
    await AppDataSource.query('TRUNCATE TABLE vacation_requests, users RESTART IDENTITY CASCADE')

    const hasher = new BcryptPasswordHasher()
    const passwordHash = await hasher.hash(DEMO_PASSWORD)
    const userRepo = AppDataSource.getRepository(UserSchema)
    const idByEmail = new Map<string, string>()

    for (const u of USERS) {
      const id = randomUUID()
      idByEmail.set(u.email, id)
      await userRepo.save({ id, name: u.name, email: u.email, passwordHash, role: u.role, createdAt: new Date() })
    }

    const requestRepo = AppDataSource.getRepository(VacationRequestSchema)
    for (const r of REQUESTS) {
      const userId = idByEmail.get(r.owner)
      if (!userId) throw new Error(`Unknown seed user: ${r.owner}`)
      const now = new Date()
      await requestRepo.save({
        id: randomUUID(),
        userId,
        startDate: dayOffset(r.start),
        endDate: dayOffset(r.end),
        reason: r.reason,
        status: r.status,
        comments: r.comments,
        createdAt: now,
        updatedAt: now,
      })
    }

    console.log(`[db:seed] Seeded ${USERS.length} users and ${REQUESTS.length} vacation requests.`)
    console.log('[db:seed] Demo accounts (all share the same password):')
    console.log(`           password: ${DEMO_PASSWORD}`)
    for (const u of USERS) {
      console.log(`           - ${u.role.padEnd(9)} ${u.email}`)
    }
  } finally {
    await AppDataSource.destroy()
  }
}

run().catch((err) => {
  console.error('[db:seed] Failed:', err)
  process.exit(1)
})
