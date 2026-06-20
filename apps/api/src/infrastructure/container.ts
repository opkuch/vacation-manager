import { AuthController } from '../controllers/AuthController'
import { VacationRequestsController } from '../controllers/VacationRequestsController'
import { AuthService } from '../application/services/AuthService'
import { UserService } from '../application/services/UserService'
import { VacationService } from '../application/services/VacationService'
import { type TokenService } from '../application/ports/TokenService'
import { BcryptPasswordHasher } from './auth/PasswordHasher'
import { JwtService } from './auth/JwtService'
import { optionalEnv, requireEnv } from './config/env'
import { AppDataSource } from './db/data-source'
import { TypeOrmUserRepository } from './db/repositories/TypeOrmUserRepository'
import { TypeOrmVacationRequestRepository } from './db/repositories/TypeOrmVacationRequestRepository'
import { InProcessEventBus } from './events/InProcessEventBus'
import { AuditLogSubscriber } from './events/subscribers/AuditLogSubscriber'
import { RealtimeBroadcastSubscriber } from './events/subscribers/RealtimeBroadcastSubscriber'
import { connectionManager } from './ws/ConnectionManager'

/** Everything the handlers need, wired once. */
export interface Container {
  readonly authController: AuthController
  readonly vacationController: VacationRequestsController
  readonly tokenService: TokenService
}

let instance: Container | null = null

/** Lazily initializes the DB connection and wires the object graph (singleton). */
export async function getContainer(): Promise<Container> {
  if (instance) return instance

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const vacationRequests = new TypeOrmVacationRequestRepository(AppDataSource)
  const users = new TypeOrmUserRepository(AppDataSource)
  const hasher = new BcryptPasswordHasher()
  const tokenService = new JwtService(requireEnv('JWT_SECRET'), optionalEnv('JWT_EXPIRES_IN', '8h'))

  const eventBus = new InProcessEventBus([
    new AuditLogSubscriber(),
    new RealtimeBroadcastSubscriber(vacationRequests, connectionManager),
  ])

  const vacationService = new VacationService(vacationRequests, eventBus)
  const authService = new AuthService(users, hasher, tokenService)
  const userService = new UserService(users)

  instance = {
    authController: new AuthController(authService, userService),
    vacationController: new VacationRequestsController(vacationService),
    tokenService,
  }
  return instance
}
