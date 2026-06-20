import { z } from 'zod'
import { UserDtoSchema, VacationRequestDtoSchema } from './dtos.js'
import { VacationStatusSchema } from './enums.js'
import { DateOnlySchema } from './primitives.js'
import { PaginationQuerySchema, paginatedSchema } from './pagination.js'

// --- Auth ---

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = z.object({
  user: UserDtoSchema,
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>

// --- Create vacation request ---

/**
 * Structural input validation for creating a request. The cheap cross-field
 * check (end on/after start) mirrors a domain rule for fast form feedback;
 * authoritative business rules (no past dates, no overlap) are enforced
 * server-side in the domain layer.
 */
export const CreateVacationRequestSchema = z
  .object({
    startDate: DateOnlySchema,
    endDate: DateOnlySchema,
    reason: z.string().trim().max(1000).optional().nullable(),
  })
  .refine((v) => v.endDate >= v.startDate, {
    path: ['endDate'],
    message: 'End date must be on or after the start date',
  })
export type CreateVacationRequest = z.infer<typeof CreateVacationRequestSchema>

// --- List / filter (validator dashboard) ---

export const ListRequestsQuerySchema = PaginationQuerySchema.extend({
  status: VacationStatusSchema.optional(),
  userId: z.string().uuid().optional(),
})
export type ListRequestsQuery = z.infer<typeof ListRequestsQuerySchema>

export const PaginatedVacationRequestsSchema = paginatedSchema(VacationRequestDtoSchema)

// --- Reject (comment required) ---

export const RejectRequestSchema = z.object({
  comment: z.string().trim().min(1, 'A rejection comment is required'),
})
export type RejectRequest = z.infer<typeof RejectRequestSchema>

// Approve carries no body today; declared for symmetry and future extension.
export const ApproveRequestSchema = z.object({}).optional()
export type ApproveRequest = z.infer<typeof ApproveRequestSchema>
