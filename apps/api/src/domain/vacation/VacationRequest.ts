import { randomUUID } from 'node:crypto'
import { ErrorCode, VacationStatus, type DateOnly, type VacationRequestDto } from '@vm/shared'
import { DomainError } from '../errors/DomainError'
import { DateRange } from './DateRange'
import {
  type DomainEvent,
  VacationRequestApproved,
  VacationRequestRejected,
  VacationRequestSubmitted,
} from './events'

interface VacationRequestProps {
  id: string
  userId: string
  userName: string
  range: DateRange
  reason: string | null
  status: VacationStatus
  comments: string | null
  createdAt: string
  updatedAt: string
}

/** Flat, persistence-friendly view of the aggregate. */
export interface VacationRequestSnapshot {
  id: string
  userId: string
  userName: string
  startDate: DateOnly
  endDate: DateOnly
  reason: string | null
  status: VacationStatus
  comments: string | null
  createdAt: string
  updatedAt: string
}

/**
 * The vacation request aggregate. It owns the status state machine — the only
 * legal transitions are Pending→Approved and Pending→Rejected — so the
 * invariants cannot be bypassed by any caller. State changes record domain
 * events that the application layer publishes after persistence.
 */
export class VacationRequest {
  private readonly events: DomainEvent[] = []

  private constructor(private readonly props: VacationRequestProps) {}

  /** Creates a fresh, Pending request and records a Submitted event. */
  static submit(input: {
    userId: string
    userName: string
    range: DateRange
    reason: string | null
  }): VacationRequest {
    const now = new Date().toISOString()
    const request = new VacationRequest({
      id: randomUUID(),
      userId: input.userId,
      userName: input.userName,
      range: input.range,
      reason: input.reason,
      status: VacationStatus.Pending,
      comments: null,
      createdAt: now,
      updatedAt: now,
    })
    request.record(
      new VacationRequestSubmitted(
        request.props.id,
        request.props.userId,
        request.props.range.startDate,
        request.props.range.endDate,
      ),
    )
    return request
  }

  /** Reconstructs an aggregate from storage; trusts the persisted state. */
  static rehydrate(snapshot: VacationRequestSnapshot): VacationRequest {
    return new VacationRequest({
      id: snapshot.id,
      userId: snapshot.userId,
      userName: snapshot.userName,
      range: DateRange.fromPersistence(snapshot.startDate, snapshot.endDate),
      reason: snapshot.reason,
      status: snapshot.status,
      comments: snapshot.comments,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    })
  }

  get id(): string {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get status(): VacationStatus {
    return this.props.status
  }

  approve(): void {
    this.ensurePending()
    this.props.status = VacationStatus.Approved
    this.touch()
    this.record(new VacationRequestApproved(this.props.id, this.props.userId))
  }

  reject(comment: string): void {
    const trimmed = comment?.trim() ?? ''
    if (trimmed.length === 0) {
      throw new DomainError(ErrorCode.REJECTION_COMMENT_REQUIRED, 'A rejection comment is required')
    }
    this.ensurePending()
    this.props.status = VacationStatus.Rejected
    this.props.comments = trimmed
    this.touch()
    this.record(new VacationRequestRejected(this.props.id, this.props.userId, trimmed))
  }

  /** Drains recorded events; the aggregate is empty afterwards. */
  pullEvents(): DomainEvent[] {
    const drained = [...this.events]
    this.events.length = 0
    return drained
  }

  toSnapshot(): VacationRequestSnapshot {
    return {
      id: this.props.id,
      userId: this.props.userId,
      userName: this.props.userName,
      startDate: this.props.range.startDate,
      endDate: this.props.range.endDate,
      reason: this.props.reason,
      status: this.props.status,
      comments: this.props.comments,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    }
  }

  toDto(): VacationRequestDto {
    return {
      id: this.props.id,
      userId: this.props.userId,
      userName: this.props.userName,
      startDate: this.props.range.startDate,
      endDate: this.props.range.endDate,
      reason: this.props.reason,
      status: this.props.status,
      comments: this.props.comments,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    }
  }

  private ensurePending(): void {
    if (this.props.status !== VacationStatus.Pending) {
      throw new DomainError(
        ErrorCode.APPROVED_IMMUTABLE,
        `A ${this.props.status} request can no longer be modified`,
      )
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date().toISOString()
  }

  private record(event: DomainEvent): void {
    this.events.push(event)
  }
}
