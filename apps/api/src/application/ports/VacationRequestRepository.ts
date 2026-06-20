import {
  type ListRequestsQuery,
  type Paginated,
  type PaginationQuery,
  type VacationRequestDto,
  type VacationStatus,
} from '@vm/shared'
import { type DateRange } from '../../domain/vacation/DateRange'
import { type VacationRequest } from '../../domain/vacation/VacationRequest'

/**
 * Persistence boundary for vacation requests. Write methods deal in the
 * aggregate; read methods return DTOs directly (reads skip the
 * domain model and project straight to the contract shape).
 */
export interface VacationRequestRepository {
  // --- write side ---
  save(request: VacationRequest): Promise<void>
  findById(id: string): Promise<VacationRequest | null>
  hasOverlap(userId: string, range: DateRange, statuses: VacationStatus[]): Promise<boolean>

  // --- read side ---
  listByUser(userId: string, query: PaginationQuery): Promise<Paginated<VacationRequestDto>>
  listAll(query: ListRequestsQuery): Promise<Paginated<VacationRequestDto>>
  listTeam(query: PaginationQuery): Promise<Paginated<VacationRequestDto>>
}
