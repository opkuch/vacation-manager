import { type EventBus, type EventSubscriber } from '../../application/bus/EventBus'
import { type DomainEvent } from '../../domain/vacation/events'

/**
 * Synchronous, in-process event bus. Each event is delivered to every
 * interested subscriber; a failing subscriber is logged but never breaks the
 * request flow or other subscribers. Swappable for a broker publisher later.
 */
export class InProcessEventBus implements EventBus {
  constructor(private readonly subscribers: readonly EventSubscriber[]) {}

  async publish(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      for (const subscriber of this.subscribers) {
        if (!subscriber.interestedIn.includes(event.name)) continue
        try {
          await subscriber.handle(event)
        } catch (err) {
          console.error(`[events] subscriber failed for ${event.name}:`, err)
        }
      }
    }
  }
}
