import { z } from 'zod'
import { RoleSchema } from './enums.js'

/** Claims encoded in the signed JWT. `sub` is the user id. */
export const JwtClaimsSchema = z.object({
  sub: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  iat: z.number().optional(),
  exp: z.number().optional(),
})
export type JwtClaims = z.infer<typeof JwtClaimsSchema>

/** Header carrying the bearer token, e.g. `Authorization: Bearer <token>`. */
export const AUTH_HEADER = 'authorization'
export const BEARER_PREFIX = 'Bearer '

/** httpOnly session cookie carrying the signed JWT (Path=/api, same-origin). */
export const SESSION_COOKIE_NAME = 'vm_session'
