import { z } from 'zod'

/**
 * Calendar date without time, formatted `YYYY-MM-DD`. Vacation boundaries are
 * whole days, so we avoid timezone ambiguity by never carrying a time component.
 */
export const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a YYYY-MM-DD date')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Not a valid calendar date')

export type DateOnly = z.infer<typeof DateOnlySchema>

/** Full ISO-8601 timestamp used for audit fields (createdAt / updatedAt). */
export const IsoDateTimeSchema = z.string().datetime({ offset: true })
