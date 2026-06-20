import { DomainEventName, RealtimeMessageType, Role, type RealtimeMessage } from '@vm/shared'
import { type EventSubscriber } from '../../../application/bus/EventBus'
import { type VacationRequestRepository } from '../../../application/ports/VacationRequestRepository'
import {
  type DomainEvent,
  VacationRequestApproved,
  VacationRequestRejected,
  VacationRequestSubmitted,
} from '../../../domain/vacation/events'
import { type ConnectionManager } from '../../ws/ConnectionManager'

/** Pushes vacation lifecycle updates to connected WebSocket clients. */
export class RealtimeBroadcastSubscriber implements EventSubscriber {
  readonly interestedIn = [
    DomainEventName.VacationRequestSubmitted,
    DomainEventName.VacationRequestApproved,
    DomainEventName.VacationRequestRejected,
  ] as const

  constructor(
    private readonly requests: VacationRequestRepository,
    private readonly connections: ConnectionManager,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    const requestId = this.requestIdFrom(event)
    const aggregate = await this.requests.findById(requestId)
    if (!aggregate) return

    const dto = aggregate.toDto()
    const message = this.toRealtimeMessage(event, dto)
    if (!message) return

    if (event instanceof VacationRequestSubmitted) {
      this.connections.broadcastToRole(Role.Validator, message)
      return
    }

    this.connections.sendToUser(dto.userId, message)
  }

  private requestIdFrom(event: DomainEvent): string {
    if (event instanceof VacationRequestSubmitted) return event.requestId
    if (event instanceof VacationRequestApproved) return event.requestId
    if (event instanceof VacationRequestRejected) return event.requestId
    throw new Error(`Unhandled domain event: ${event.name}`)
  }

  private toRealtimeMessage(event: DomainEvent, request: RealtimeMessage['request']): RealtimeMessage | null {
    switch (event.name) {
      case DomainEventName.VacationRequestSubmitted:
        return { type: RealtimeMessageType.RequestSubmitted, request }
      case DomainEventName.VacationRequestApproved:
        return { type: RealtimeMessageType.RequestApproved, request }
      case DomainEventName.VacationRequestRejected:
        return { type: RealtimeMessageType.RequestRejected, request }
      default:
        return null
    }
  }
}
