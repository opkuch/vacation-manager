import { ErrorCode } from '@vm/shared'

/**
 * The single error type the domain and application layers throw. It carries a
 * shared `ErrorCode`, which the HTTP edge maps to a status via `ERROR_HTTP_STATUS`.
 * Keeping one typed error keeps the transport free of business knowledge.
 */
export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'DomainError'
    // Preserve instanceof across the transpile target.
    Object.setPrototypeOf(this, DomainError.prototype)
  }
}
