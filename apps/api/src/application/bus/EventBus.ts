import { type DomainEventName } from '@vm/shared'
import { type DomainEvent } from '../../domain/vacation/events'

/**
 * Publishes domain events to in-process subscribers. Modelled as a port so the
 * implementation can later forward to a broker (SQS/SNS) without the domain or
 * application layers changing.
 */
export interface EventBus {
  publish(events: readonly DomainEvent[]): Promise<void>
}

export interface EventSubscriber {
  readonly interestedIn: readonly DomainEventName[]
  handle(event: DomainEvent): Promise<void>
}
