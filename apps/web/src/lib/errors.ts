import axios from 'axios'
import { ApiErrorSchema, ErrorCode, type ApiError } from '@vm/shared'

/** Single place mapping contract error codes to user-facing copy. */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION]: 'Some fields are invalid. Please review and try again.',
  [ErrorCode.UNAUTHORIZED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to perform this action.",
  [ErrorCode.NOT_FOUND]: 'The requested item could not be found.',
  [ErrorCode.OVERLAP_CONFLICT]: 'This request overlaps an existing vacation request.',
  [ErrorCode.APPROVED_IMMUTABLE]: 'An approved request can no longer be changed.',
  [ErrorCode.PAST_DATE]: 'Vacation dates cannot be in the past.',
  [ErrorCode.INVALID_DATE_RANGE]: 'The end date must be on or after the start date.',
  [ErrorCode.REJECTION_COMMENT_REQUIRED]: 'A rejection comment is required.',
  [ErrorCode.INTERNAL]: 'Something went wrong on our end. Please try again later.',
}

/** Maps OVERLAP_CONFLICT / PAST_DATE / INVALID_DATE_RANGE onto a form field. */
export const ERROR_FIELD: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.PAST_DATE]: 'startDate',
  [ErrorCode.INVALID_DATE_RANGE]: 'endDate',
  [ErrorCode.OVERLAP_CONFLICT]: 'startDate',
}

export interface NormalizedError {
  code: ErrorCode | null
  message: string
  field?: string
}

/** Extracts the shared ApiError envelope from an unknown thrown value. */
export function parseApiError(err: unknown): ApiError | null {
  if (axios.isAxiosError(err)) {
    const parsed = ApiErrorSchema.safeParse(err.response?.data)
    if (parsed.success) return parsed.data
  }
  return null
}

/** Turns any thrown value into a friendly, optionally field-scoped error. */
export function normalizeError(err: unknown): NormalizedError {
  const api = parseApiError(err)
  if (api) {
    const { code, message } = api.error
    return { code, message: ERROR_MESSAGES[code] ?? message, field: ERROR_FIELD[code] }
  }
  if (axios.isAxiosError(err) && err.code === 'ERR_NETWORK') {
    return { code: null, message: 'Unable to reach the server. Check your connection.' }
  }
  return { code: null, message: 'An unexpected error occurred.' }
}
