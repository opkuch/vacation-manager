import bcrypt from 'bcryptjs'
import { type PasswordHasher } from '../../application/ports/PasswordHasher'

const SALT_ROUNDS = 10

/** `bcryptjs`-backed adapter for the `PasswordHasher` port. */
export class BcryptPasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash)
  }
}
