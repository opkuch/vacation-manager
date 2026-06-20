import { AUTH_HEADER, BEARER_PREFIX, ErrorCode, type JwtClaims, type Role } from '@vm/shared'
import { DomainError } from '../../domain/errors/DomainError'
import { getContainer } from '../../infrastructure/container'
import { toErrorResponse } from './respond'
import { type AuthedHandler, type CommonEvent, type HandlerFn } from './types'

/**
 * Authentication: extract and verify the bearer token into claims.
 * Throws `DomainError(UNAUTHORIZED)` when the header is missing/malformed or the
 * token is invalid. This is identity only — no role logic here.
 */
export async function authenticate(event: CommonEvent): Promise<JwtClaims> {
  const header = event.headers?.[AUTH_HEADER] ?? event.headers?.['Authorization']
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    throw new DomainError(ErrorCode.UNAUTHORIZED, 'Missing or malformed Authorization header')
  }
  const token = header.slice(BEARER_PREFIX.length)
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
