import { In, type DataSource, type FindOptionsWhere, type Repository } from 'typeorm'
import {
  VacationStatus,
  type ListRequestsQuery,
  type Paginated,
  type PaginationQuery,
  type VacationRequestDto,
} from '@vm/shared'
import { type VacationRequestRepository } from '../../../application/ports/VacationRequestRepository'
import { type DateRange } from '../../../domain/vacation/DateRange'
import { VacationRequest } from '../../../domain/vacation/VacationRequest'
import { UserSchema, type UserRow } from '../entities/UserEntity'
import { VacationRequestSchema, type VacationRequestRow } from '../entities/VacationRequestEntity'

const TEAM_VISIBLE: VacationStatus[] = [VacationStatus.Pending, VacationStatus.Approved]

export class TypeOrmVacationRequestRepository implements VacationRequestRepository {
  private readonly repo: Repository<VacationRequestRow>
  private readonly users: Repository<UserRow>

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(VacationRequestSchema)
    this.users = dataSource.getRepository(UserSchema)
  }

  async save(request: VacationRequest): Promise<void> {
    const s = request.toSnapshot()
    await this.repo.save({
      id: s.id,
      userId: s.userId,
      startDate: s.startDate,
      endDate: s.endDate,
      reason: s.reason,
      status: s.status,
      comments: s.comments,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    })
  }

  async findById(id: string): Promise<VacationRequest | null> {
    const row = await this.repo.findOne({ where: { id }, relations: { user: true } })
    if (!row) return null
    return VacationRequest.rehydrate({
      id: row.id,
      userId: row.userId,
      userName: row.user?.name ?? '',
      startDate: row.startDate,
      endDate: row.endDate,
      reason: row.reason,
      status: row.status,
      comments: row.comments,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  }

  async hasOverlap(userId: string, range: DateRange, statuses: VacationStatus[]): Promise<boolean> {
    const count = await this.repo
      .createQueryBuilder('vr')
      .where('vr.userId = :userId', { userId })
      .andWhere('vr.status IN (:...statuses)', { statuses })
      // Inclusive overlap: existing.start <= new.end AND existing.end >= new.start.
      .andWhere('vr.startDate <= :end AND vr.endDate >= :start', {
        start: range.startDate,
        end: range.endDate,
      })
      .getCount()
    return count > 0
  }

  listByUser(userId: string, query: PaginationQuery): Promise<Paginated<VacationRequestDto>> {
    return this.paginate({ userId }, query.page, query.pageSize)
  }

  listAll(query: ListRequestsQuery): Promise<Paginated<VacationRequestDto>> {
    const where: FindOptionsWhere<VacationRequestRow> = {}
    if (query.status) where.status = query.status
    if (query.userId) where.userId = query.userId
    return this.paginate(where, query.page, query.pageSize)
  }

  listTeam(query: PaginationQuery): Promise<Paginated<VacationRequestDto>> {
    return this.paginate({ status: In(TEAM_VISIBLE) }, query.page, query.pageSize)
  }

  private async paginate(
    where: FindOptionsWhere<VacationRequestRow>,
    page: number,
    pageSize: number,
  ): Promise<Paginated<VacationRequestDto>> {
    const [rows, total] = await this.repo.findAndCount({
      where,
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      data: rows.map((row) => this.toDto(row)),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  }

  private toDto(row: VacationRequestRow): VacationRequestDto {
    return {
      id: row.id,
      userId: row.userId,
      userName: row.user?.name ?? '',
      startDate: row.startDate,
      endDate: row.endDate,
      reason: row.reason,
      status: row.status,
      comments: row.comments,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }
  }
}
