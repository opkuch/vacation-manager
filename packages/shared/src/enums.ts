import { z } from 'zod'

/** Who a user is allowed to act as. Drives role-based access control. */
export const Role = {
  Requester: 'Requester',
  Validator: 'Validator',
} as const
export const RoleSchema = z.enum([Role.Requester, Role.Validator])
export type Role = z.infer<typeof RoleSchema>

/** Lifecycle of a vacation request. Transitions are owned by the domain. */
export const VacationStatus = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
} as const
export const VacationStatusSchema = z.enum([
  VacationStatus.Pending,
  VacationStatus.Approved,
  VacationStatus.Rejected,
])
export type VacationStatus = z.infer<typeof VacationStatusSchema>
