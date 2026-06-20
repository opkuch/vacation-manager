import {
  CreateVacationRequestSchema,
  ListRequestsQuerySchema,
  PaginationQuerySchema,
  RejectRequestSchema,
  Role,
  type CreateVacationRequest,
  type ListRequestsQuery,
  type PaginationQuery,
  type RejectRequest,
} from '@vm/shared'
import { getContainer } from '../infrastructure/container'
import { parseBody, parseQuery } from './_shared/parse'
import { type HandlerFn } from './_shared/types'
import { withAuth } from './_shared/withAuth'

// POST /vacation-requests (Requester)
export const parseCreateRequest = parseBody(CreateVacationRequestSchema)

export const createRequest: HandlerFn = withAuth(Role.Requester)<CreateVacationRequest>(
  async (input, ctx) => {
    const { vacationController } = await getContainer()
    return vacationController.createRequest(input, ctx)
  },
)

// GET /vacation-requests/mine (Requester)
export const parseListMine = parseQuery(PaginationQuerySchema)

export const listMine: HandlerFn = withAuth(Role.Requester)<PaginationQuery>(async (input, ctx) => {
  const { vacationController } = await getContainer()
  return vacationController.listMine(input, ctx)
})

// GET /vacation-requests (Validator) — filter by status + userId
export const parseListAll = parseQuery(ListRequestsQuerySchema)

export const listAll: HandlerFn = withAuth(Role.Validator)<ListRequestsQuery>(async (input) => {
  const { vacationController } = await getContainer()
  return vacationController.listAll(input)
})

// GET /vacation-requests/team (authenticated, any role)
export const parseListTeam = parseQuery(PaginationQuerySchema)

export const listTeam: HandlerFn = withAuth()<PaginationQuery>(async (input) => {
  const { vacationController } = await getContainer()
  return vacationController.listTeam(input)
})

// POST /vacation-requests/:id/approve (Validator)
export const approveRequest: HandlerFn = withAuth(Role.Validator)(async (_input, ctx) => {
  const { vacationController } = await getContainer()
  return vacationController.approveRequest(ctx)
})

// POST /vacation-requests/:id/reject (Validator) — comment required
export const parseRejectRequest = parseBody(RejectRequestSchema)

export const rejectRequest: HandlerFn = withAuth(Role.Validator)<RejectRequest>(
  async (input, ctx) => {
    const { vacationController } = await getContainer()
    return vacationController.rejectRequest(input, ctx)
  },
)
