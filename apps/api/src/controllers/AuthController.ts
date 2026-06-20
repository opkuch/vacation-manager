import { Response } from 'commoneventframework'
import { type LoginRequest } from '@vm/shared'
import { type AuthService } from '../application/services/AuthService'
import { type UserService } from '../application/services/UserService'
import { type AuthContext } from '../handlers/_shared/types'

export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserService,
  ) {}

  async login(input: LoginRequest): Promise<Response> {
    return new Response(200, await this.auth.login(input))
  }

  async me(ctx: AuthContext): Promise<Response> {
    return new Response(200, await this.users.getById(ctx.user.sub))
  }
}
