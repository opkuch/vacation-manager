import jwt, { type SignOptions } from 'jsonwebtoken'
import { ErrorCode, JwtClaimsSchema, type JwtClaims } from '@vm/shared'
import { type TokenService } from '../../application/ports/TokenService'
import { DomainError } from '../../domain/errors/DomainError'

/** `jsonwebtoken`-backed adapter for the `TokenService` port. */
export class JwtService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(claims: Pick<JwtClaims, 'sub' | 'name' | 'email' | 'role'>): string {
    return jwt.sign(claims, this.secret, { expiresIn: this.expiresIn as SignOptions['expiresIn'] })
  }

  verify(token: string): JwtClaims {
    try {
      const decoded = jwt.verify(token, this.secret)
      return JwtClaimsSchema.parse(decoded)
    } catch {
      throw new DomainError(ErrorCode.UNAUTHORIZED, 'Invalid or expired token')
    }
  }
}
