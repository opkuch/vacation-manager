import { DomainEventName } from '@vm/shared'
import { type EventSubscriber } from '../../../application/bus/EventBus'
import { type DomainEvent } from '../../../domain/vacation/events'

/**
 * Records every vacation lifecycle event. Today it writes a structured line to
 * the log; the HR roadmap (compliance/audit) can later persist these instead
 * without touching producers.
 */
export class AuditLogSubscriber implements EventSubscriber {
  readonly interestedIn = [
    DomainEventName.VacationRequestSubmitted,
    DomainEventName.VacationRequestApproved,
    DomainEventName.VacationRequestRejected,
  ] as const

  async handle(event: DomainEvent): Promise<void> {
    console.log('[audit]', JSON.stringify(event))
  }
}
