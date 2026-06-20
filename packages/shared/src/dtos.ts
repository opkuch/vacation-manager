import { z } from 'zod'
import { RoleSchema, VacationStatusSchema } from './enums.js'
import { DateOnlySchema, IsoDateTimeSchema } from './primitives.js'

/** Public-facing user shape. Never includes the password hash. */
export const UserDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  createdAt: IsoDateTimeSchema,
})
export type UserDto = z.infer<typeof UserDtoSchema>

/**
 * Vacation request as returned by the API. `userName` is denormalized onto the
 * DTO so list/dashboard views avoid an extra lookup per row.
 */
export const VacationRequestDtoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  startDate: DateOnlySchema,
  endDate: DateOnlySchema,
  reason: z.string().nullable(),
  status: VacationStatusSchema,
  comments: z.string().nullable(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})
export type VacationRequestDto = z.infer<typeof VacationRequestDtoSchema>
