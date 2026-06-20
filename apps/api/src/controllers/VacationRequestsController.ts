import { Response } from 'commoneventframework'
import {
  ErrorCode,
  type CreateVacationRequest,
  type ListRequestsQuery,
  type PaginationQuery,
  type RejectRequest,
} from '@vm/shared'
import { type VacationService } from '../application/services/VacationService'
import { DomainError } from '../domain/errors/DomainError'
import { type AuthContext } from '../handlers/_shared/types'

export class VacationRequestsController {
  constructor(private readonly vacations: VacationService) {}

  async createRequest(input: CreateVacationRequest, ctx: AuthContext): Promise<Response> {
    const dto = await this.vacations.createRequest({
      userId: ctx.user.sub,
      userName: ctx.user.name,
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason ?? null,
    })
    return new Response(201, dto)
  }

  async listMine(input: PaginationQuery, ctx: AuthContext): Promise<Response> {
    return new Response(200, await this.vacations.listByUser({ userId: ctx.user.sub, ...input }))
  }

  async listAll(input: ListRequestsQuery): Promise<Response> {
    return new Response(200, await this.vacations.listAll(input))
  }

  async listTeam(input: PaginationQuery): Promise<Response> {
    return new Response(200, await this.vacations.listTeam(input))
  }

  async approveRequest(ctx: AuthContext): Promise<Response> {
    const requestId = requireId(ctx.event)
    return new Response(200, await this.vacations.approveRequest(requestId))
  }

  async rejectRequest(input: RejectRequest, ctx: AuthContext): Promise<Response> {
    const requestId = requireId(ctx.event)
    return new Response(200, await this.vacations.rejectRequest(requestId, input.comment))
  }
}

function requireId(event: AuthContext['event']): string {
  const id = event.pathParameters?.id
  if (!id) {
    throw new DomainError(ErrorCode.VALIDATION, 'Missing path parameter: id')
  }
  return id
}
