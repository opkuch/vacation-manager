import {
  ErrorCode,
  VacationStatus,
  type DateOnly,
  type ListRequestsQuery,
  type Paginated,
  type PaginationQuery,
  type VacationRequestDto,
} from '@vm/shared'
import { DomainError } from '../../domain/errors/DomainError'
import { DateRange } from '../../domain/vacation/DateRange'
import { VacationRequest } from '../../domain/vacation/VacationRequest'
import { type EventBus } from '../bus/EventBus'
import { type VacationRequestRepository } from '../ports/VacationRequestRepository'

export interface CreateVacationRequestInput {
  userId: string
  userName: string
  startDate: DateOnly
  endDate: DateOnly
  reason: string | null
}

export interface ListByUserInput extends PaginationQuery {
  userId: string
}

/** Pending and Approved requests both reserve days, so both block new overlaps. */
const BLOCKING_STATUSES: VacationStatus[] = [VacationStatus.Pending, VacationStatus.Approved]

export class VacationService {
  constructor(
    private readonly requests: VacationRequestRepository,
    private readonly events: EventBus,
  ) {}

  async createRequest(input: CreateVacationRequestInput): Promise<VacationRequestDto> {
    const range = DateRange.create(input.startDate, input.endDate)

    if (await this.requests.hasOverlap(input.userId, range, BLOCKING_STATUSES)) {
      throw new DomainError(
        ErrorCode.OVERLAP_CONFLICT,
        'This request overlaps an existing pending or approved request',
      )
    }

    const request = VacationRequest.submit({
      userId: input.userId,
      userName: input.userName,
      range,
      reason: input.reason,
    })

    await this.requests.save(request)
    await this.events.publish(request.pullEvents())

    return request.toDto()
  }

  async approveRequest(requestId: string): Promise<VacationRequestDto> {
    const request = await this.requests.findById(requestId)
    if (!request) {
      throw new DomainError(ErrorCode.NOT_FOUND, 'Vacation request not found')
    }

    request.approve()

    await this.requests.save(request)
    await this.events.publish(request.pullEvents())

    return request.toDto()
  }

  async rejectRequest(requestId: string, comment: string): Promise<VacationRequestDto> {
    const request = await this.requests.findById(requestId)
    if (!request) {
      throw new DomainError(ErrorCode.NOT_FOUND, 'Vacation request not found')
    }

    request.reject(comment)

    await this.requests.save(request)
    await this.events.publish(request.pullEvents())

    return request.toDto()
  }

  listByUser(query: ListByUserInput): Promise<Paginated<VacationRequestDto>> {
    return this.requests.listByUser(query.userId, { page: query.page, pageSize: query.pageSize })
  }

  listAll(query: ListRequestsQuery): Promise<Paginated<VacationRequestDto>> {
    return this.requests.listAll(query)
  }

  listTeam(query: PaginationQuery): Promise<Paginated<VacationRequestDto>> {
    return this.requests.listTeam(query)
  }
}
