import { z } from 'zod'

/**
 * Stable, machine-readable error codes shared by both sides. The API maps each
 * code to an HTTP status; the Web app maps each code to a user-facing message.
 */
export const ErrorCode = {
  VALIDATION: 'VALIDATION',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  OVERLAP_CONFLICT: 'OVERLAP_CONFLICT',
  APPROVED_IMMUTABLE: 'APPROVED_IMMUTABLE',
  PAST_DATE: 'PAST_DATE',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  REJECTION_COMMENT_REQUIRED: 'REJECTION_COMMENT_REQUIRED',
  INTERNAL: 'INTERNAL',
} as const
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

/** Canonical HTTP status for each error code (single source of truth). */
export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  OVERLAP_CONFLICT: 409,
  APPROVED_IMMUTABLE: 409,
  PAST_DATE: 422,
  INVALID_DATE_RANGE: 422,
  REJECTION_COMMENT_REQUIRED: 422,
  INTERNAL: 500,
}

/** Uniform error envelope returned by every endpoint on failure. */
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.nativeEnum(ErrorCode),
    message: z.string(),
    details: z.unknown().optional(),
  }),
})
export type ApiError = z.infer<typeof ApiErrorSchema>
