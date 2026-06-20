/** Hashes and verifies passwords. Implemented by an infrastructure adapter. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>
  compare(plain: string, hash: string): Promise<boolean>
}
