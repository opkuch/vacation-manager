import { Response } from 'commoneventframework'
import { type LoginRequest } from '@vm/shared'
import { type AuthService } from '../application/services/AuthService'
import { type UserService } from '../application/services/UserService'
import { buildClearSessionCookie, buildSessionCookie } from '../infrastructure/auth/sessionCookie'
import { type AuthContext } from '../handlers/_shared/types'

export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserService,
  ) {}

  async login(input: LoginRequest): Promise<Response> {
    const { token, user } = await this.auth.login(input)
    return new Response(200, { user }, { 'Set-Cookie': buildSessionCookie(token) })
  }

  async logout(): Promise<Response> {
    return new Response(200, { ok: true }, { 'Set-Cookie': buildClearSessionCookie() })
  }

  async me(ctx: AuthContext): Promise<Response> {
    return new Response(200, await this.users.getById(ctx.user.sub))
  }
}
