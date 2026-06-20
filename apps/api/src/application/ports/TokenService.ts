import { type JwtClaims } from '@vm/shared'

/** Issues and verifies bearer tokens. Implemented by an infrastructure adapter. */
export interface TokenService {
  sign(claims: Pick<JwtClaims, 'sub' | 'name' | 'email' | 'role'>): string
  /** Returns verified claims or throws `DomainError(UNAUTHORIZED)`. */
  verify(token: string): JwtClaims
}
