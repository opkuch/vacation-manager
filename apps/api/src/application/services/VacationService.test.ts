import { beforeEach, describe, expect, it } from 'vitest'
import {
  ErrorCode,
  VacationStatus,
  type DateOnly,
  type ListRequestsQuery,
  type Paginated,
  type PaginationQuery,
  type VacationRequestDto,
} from '@vm/shared'
import { type EventBus } from '../bus/EventBus'
import { type VacationRequestRepository } from '../ports/VacationRequestRepository'
import { type DomainError } from '../../domain/errors/DomainError'
import { type DateRange } from '../../domain/vacation/DateRange'
import { type DomainEvent } from '../../domain/vacation/events'
import { type VacationRequest } from '../../domain/vacation/VacationRequest'
import { VacationService, type CreateVacationRequestInput } from './VacationService'

/** Adds N days to today and returns a YYYY-MM-DD string. */
function daysFromNow(days: number): DateOnly {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

class InMemoryVacationRequestRepository implements VacationRequestRepository {
  readonly saved: VacationRequest[] = []
  private overlap = false

  withOverlap(value: boolean): this {
    this.overlap = value
    return this
  }

  async save(request: VacationRequest): Promise<void> {
    this.saved.push(request)
  }

  async findById(): Promise<VacationRequest | null> {
    return null
  }

  async hasOverlap(_userId: string, _range: DateRange, _statuses: VacationStatus[]): Promise<boolean> {
    return this.overlap
  }

  async listByUser(): Promise<Paginated<VacationRequestDto>> {
    return this.empty()
  }

  async listAll(_query: ListRequestsQuery): Promise<Paginated<VacationRequestDto>> {
    return this.empty()
  }

  async listTeam(_query: PaginationQuery): Promise<Paginated<VacationRequestDto>> {
    return this.empty()
  }

  private empty(): Paginated<VacationRequestDto> {
    return { data: [], page: 1, pageSize: 10, total: 0, totalPages: 1 }
  }
}

class RecordingEventBus implements EventBus {
  readonly published: DomainEvent[] = []
  async publish(events: readonly DomainEvent[]): Promise<void> {
    this.published.push(...events)
  }
}

const baseInput: Omit<CreateVacationRequestInput, 'startDate' | 'endDate'> = {
  userId: 'u-1',
  userName: 'Ada',
  reason: 'Holiday',
}

describe('VacationService', () => {
  let repo: InMemoryVacationRequestRepository
  let events: RecordingEventBus
  let service: VacationService

  beforeEach(() => {
    repo = new InMemoryVacationRequestRepository()
    events = new RecordingEventBus()
    service = new VacationService(repo, events)
  })

  describe('createRequest', () => {
    it('creates a Pending request, persists it, and publishes a Submitted event', async () => {
      const dto = await service.createRequest({
        ...baseInput,
        startDate: daysFromNow(10),
        endDate: daysFromNow(12),
      })

      expect(dto.status).toBe(VacationStatus.Pending)
      expect(dto.userId).toBe('u-1')
      expect(dto.userName).toBe('Ada')
      expect(repo.saved).toHaveLength(1)
      expect(events.published).toHaveLength(1)
      expect(events.published[0]?.name).toBe('VacationRequestSubmitted')
    })

    it('rejects an overlapping request with OVERLAP_CONFLICT', async () => {
      repo.withOverlap(true)
      try {
        await service.createRequest({ ...baseInput, startDate: daysFromNow(10), endDate: daysFromNow(12) })
        expect.unreachable('should have thrown')
      } catch (err) {
        expect((err as DomainError).code).toBe(ErrorCode.OVERLAP_CONFLICT)
      }
      expect(repo.saved).toHaveLength(0)
      expect(events.published).toHaveLength(0)
    })

    it('rejects an invalid date range before touching the repository', async () => {
      await expect(
        service.createRequest({ ...baseInput, startDate: daysFromNow(12), endDate: daysFromNow(10) }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_DATE_RANGE })
      expect(repo.saved).toHaveLength(0)
    })
  })
})
