import { DomainEventName } from '@vm/shared'
import { type EventSubscriber } from '../../../application/bus/EventBus'
import { type DomainEvent } from '../../../domain/vacation/events'

/**
 * Stub for outbound notifications (email/push). It only reacts to decisions a
 * requester would care about. Wiring a real channel later is additive.
 */
export class NotificationSubscriber implements EventSubscriber {
  readonly interestedIn = [
    DomainEventName.VacationRequestApproved,
    DomainEventName.VacationRequestRejected,
  ] as const

  async handle(event: DomainEvent): Promise<void> {
    console.log(`[notify] (stub) would notify the requester about ${event.name}`)
  }
}
