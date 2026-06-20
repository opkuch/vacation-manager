import { ErrorCode, type LoginRequest, type UserDto } from '@vm/shared'
import { DomainError } from '../../domain/errors/DomainError'
import { type PasswordHasher } from '../ports/PasswordHasher'
import { type TokenService } from '../ports/TokenService'
import { type UserRepository } from '../ports/UserRepository'

export interface IssuedSession {
  token: string
  user: UserDto
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async login(input: LoginRequest): Promise<IssuedSession> {
    const user = await this.users.findByEmail(input.email)
    // Same error whether the email is unknown or the password is wrong.
    if (!user || !(await this.hasher.compare(input.password, user.passwordHash))) {
      throw new DomainError(ErrorCode.UNAUTHORIZED, 'Invalid email or password')
    }

    return {
      token: this.tokens.sign(user.claims),
      user: user.toDto(),
    }
  }
}
