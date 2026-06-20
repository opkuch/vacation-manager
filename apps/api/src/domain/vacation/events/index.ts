import { DomainEventName, type DateOnly } from '@vm/shared'

/** Common shape for in-process domain events published after a state change. */
export interface DomainEvent {
  readonly name: DomainEventName
  readonly occurredAt: string
}

export class VacationRequestSubmitted implements DomainEvent {
  readonly name = DomainEventName.VacationRequestSubmitted
  readonly occurredAt = new Date().toISOString()
  constructor(
    readonly requestId: string,
    readonly userId: string,
    readonly startDate: DateOnly,
    readonly endDate: DateOnly,
  ) {}
}

export class VacationRequestApproved implements DomainEvent {
  readonly name = DomainEventName.VacationRequestApproved
  readonly occurredAt = new Date().toISOString()
  constructor(
    readonly requestId: string,
    readonly userId: string,
  ) {}
}

export class VacationRequestRejected implements DomainEvent {
  readonly name = DomainEventName.VacationRequestRejected
  readonly occurredAt = new Date().toISOString()
  constructor(
    readonly requestId: string,
    readonly userId: string,
    readonly comment: string,
  ) {}
}
