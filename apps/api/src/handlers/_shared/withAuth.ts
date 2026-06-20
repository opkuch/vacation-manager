import { AUTH_HEADER, BEARER_PREFIX, ErrorCode, type JwtClaims, type Role } from '@vm/shared'
import { DomainError } from '../../domain/errors/DomainError'
import { getSessionTokenFromEvent } from '../../infrastructure/auth/sessionCookie'
import { getContainer } from '../../infrastructure/container'
import { toErrorResponse } from './respond'
import { type AuthedHandler, type CommonEvent, type HandlerFn } from './types'

function readBearerToken(event: CommonEvent): string | null {
  const header = event.headers?.[AUTH_HEADER] ?? event.headers?.['Authorization']
  if (!header || !header.startsWith(BEARER_PREFIX)) return null
  return header.slice(BEARER_PREFIX.length)
}

/**
 * Authentication: verify the httpOnly session cookie (preferred) or bearer token.
 * Throws `DomainError(UNAUTHORIZED)` when credentials are missing or invalid.
 * This is identity only — no role logic here.
 */
export async function authenticate(event: CommonEvent): Promise<JwtClaims> {
  const token = getSessionTokenFromEvent(event) ?? readBearerToken(event)
  if (!token) {
    throw new DomainError(ErrorCode.UNAUTHORIZED, 'Missing or invalid session')
  }
  const { tokenService } = await getContainer()
  return tokenService.verify(token)
}

/**
 * Authorization: a pure role-policy check. An empty role list means
 * "any authenticated user". Throws `DomainError(FORBIDDEN)` otherwise.
 */
export function authorize(user: JwtClaims, roles: readonly Role[]): void {
  if (roles.length === 0) return
  if (!roles.includes(user.role)) {
    throw new DomainError(ErrorCode.FORBIDDEN, 'You do not have permission to perform this action')
  }
}

/**
 * Composes `authenticate` then `authorize`, adapting an `AuthedHandler` to a CEF
 * `HandlerFn`. The authenticated identity is passed explicitly via context —
 * never through global mutable state.
 */
export function withAuth(...roles: Role[]) {
  return <I = unknown>(handler: AuthedHandler<I>): HandlerFn =>
    async (input, event) => {
      try {
        const user = await authenticate(event)
        authorize(user, roles)
        return await handler(input as I, { user, event })
      } catch (err) {
        return toErrorResponse(err)
      }
    }
}
