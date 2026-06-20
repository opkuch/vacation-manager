import { Response } from 'commoneventframework'
import { type ZodSchema } from 'zod'
import { ErrorCode, ERROR_HTTP_STATUS } from '@vm/shared'
import { type CommonEvent } from './types'

function validationFailed(details: unknown): Response {
  return new Response(ERROR_HTTP_STATUS[ErrorCode.VALIDATION], {
    error: { code: ErrorCode.VALIDATION, message: 'Validation failed', details },
  })
}

/**
 * Builds a CEF inputParser that validates the JSON body against a shared Zod
 * schema. On failure it returns a 400 `Response`, which CEF sends directly.
 */
export const parseBody =
  <T>(schema: ZodSchema<T>) =>
  (event: CommonEvent): T | Response => {
    let raw: unknown = {}
    if (event.body) {
      try {
        raw = JSON.parse(event.body)
      } catch {
        return new Response(ERROR_HTTP_STATUS[ErrorCode.VALIDATION], {
          error: { code: ErrorCode.VALIDATION, message: 'Request body is not valid JSON' },
        })
      }
    }
    const result = schema.safeParse(raw)
    return result.success ? result.data : validationFailed(result.error.flatten())
  }

/** Builds a CEF inputParser that validates the query string against a Zod schema. */
export const parseQuery =
  <T>(schema: ZodSchema<T>) =>
  (event: CommonEvent): T | Response => {
    const result = schema.safeParse(event.queryStringParameters ?? {})
    return result.success ? result.data : validationFailed(result.error.flatten())
  }
