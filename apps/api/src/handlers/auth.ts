import {
  CreateVacationRequestSchema,
  ListRequestsQuerySchema,
  LoginRequestSchema,
  PaginationQuerySchema,
  RejectRequestSchema,
  Role,
  type CreateVacationRequest,
  type ListRequestsQuery,
  type LoginRequest,
  type PaginationQuery,
  type RejectRequest,
} from '@vm/shared'
import { getContainer } from '../infrastructure/container'
import { parseBody, parseQuery } from './_shared/parse'
import { withErrors } from './_shared/respond'
import { type HandlerFn } from './_shared/types'
import { withAuth } from './_shared/withAuth'

// POST /auth/login (public)
export const parseLogin = parseBody(LoginRequestSchema)

export const login: HandlerFn = withErrors(async (input: LoginRequest) => {
  const { authController } = await getContainer()
  return authController.login(input)
})

// POST /auth/logout (public — clears cookie even when already logged out)
export const logout: HandlerFn = withErrors(async () => {
  const { authController } = await getContainer()
  return authController.logout()
})

// GET /auth/me (authenticated, any role)
export const me: HandlerFn = withAuth()(async (_input, ctx) => {
  const { authController } = await getContainer()
  return authController.me(ctx)
})
