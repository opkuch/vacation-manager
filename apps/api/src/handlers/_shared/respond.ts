import { Response } from 'commoneventframework'
import { ZodError } from 'zod'
import { ErrorCode, ERROR_HTTP_STATUS, type ApiError } from '@vm/shared'
import { DomainError } from '../../domain/errors/DomainError'
import { type HandlerFn } from './types'

/** Builds the uniform error envelope mandated by the contract. */
function envelope(code: ErrorCode, message: string, details?: unknown): ApiError {
  return { error: { code, message, ...(details === undefined ? {} : { details }) } }
}

/** Maps any thrown value to the contract's error Response. */
export function toErrorResponse(err: unknown): Response {
  if (err instanceof DomainError) {
    return new Response(ERROR_HTTP_STATUS[err.code], envelope(err.code, err.message, err.details))
  }
  if (err instanceof ZodError) {
    return new Response(
      ERROR_HTTP_STATUS[ErrorCode.VALIDATION],
      envelope(ErrorCode.VALIDATION, 'Validation failed', err.flatten()),
    )
  }
  console.error('[unhandled]', err)
  return new Response(
    ERROR_HTTP_STATUS[ErrorCode.INTERNAL],
    envelope(ErrorCode.INTERNAL, 'Internal server error'),
  )
}

/** Wraps a handler so thrown DomainErrors/ZodErrors become proper Responses. */
export const withErrors =
  (handler: HandlerFn): HandlerFn =>
  async (input, event) => {
    try {
      return await handler(input, event)
    } catch (err) {
      return toErrorResponse(err)
    }
  }
