import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  RealtimeMessageType,
  Role,
  VacationStatus,
  type RealtimeMessage,
} from '@vm/shared'
import { DateRange } from '../../../domain/vacation/DateRange'
import {
  VacationRequestApproved,
  VacationRequestRejected,
  VacationRequestSubmitted,
} from '../../../domain/vacation/events'
import { VacationRequest } from '../../../domain/vacation/VacationRequest'
import { type VacationRequestRepository } from '../../../application/ports/VacationRequestRepository'
import { ConnectionManager } from '../../ws/ConnectionManager'
import { RealtimeBroadcastSubscriber } from './RealtimeBroadcastSubscriber'

class MockConnectionManager extends ConnectionManager {
  roleCalls: Array<{ role: Role; message: RealtimeMessage }> = []
  userCalls: Array<{ userId: string; message: RealtimeMessage }> = []

  override broadcastToRole(role: Role, message: RealtimeMessage): void {
    this.roleCalls.push({ role, message })
  }

  override sendToUser(userId: string, message: RealtimeMessage): void {
    this.userCalls.push({ userId, message })
  }
}

describe('RealtimeBroadcastSubscriber', () => {
  let repo: VacationRequestRepository
  let connections: MockConnectionManager
  let subscriber: RealtimeBroadcastSubscriber
  let request: VacationRequest

  beforeEach(() => {
    request = VacationRequest.submit({
      userId: '11111111-1111-4111-8111-111111111111',
      userName: 'Alice',
      range: DateRange.create('2026-07-01', '2026-07-05'),
      reason: 'Holiday',
    })

    repo = {
      findById: vi.fn(async (id: string) => (id === request.id ? request : null)),
      save: vi.fn(),
      hasOverlap: vi.fn(),
      listByUser: vi.fn(),
      listAll: vi.fn(),
      listTeam: vi.fn(),
    }

    connections = new MockConnectionManager()
    subscriber = new RealtimeBroadcastSubscriber(repo, connections)
  })

  it('broadcasts submitted events to validators only', async () => {
    const event = new VacationRequestSubmitted(
      request.id,
      request.userId,
      '2026-07-01',
      '2026-07-05',
    )

    await subscriber.handle(event)

    expect(connections.roleCalls).toHaveLength(1)
    expect(connections.roleCalls[0]?.role).toBe(Role.Validator)
    expect(connections.roleCalls[0]?.message.type).toBe(RealtimeMessageType.RequestSubmitted)
    expect(connections.roleCalls[0]?.message.request.userName).toBe('Alice')
    expect(connections.userCalls).toHaveLength(0)
  })

  it('sends approved events to the requester', async () => {
    request.approve()
    const event = new VacationRequestApproved(request.id, request.userId)

    await subscriber.handle(event)

    expect(connections.userCalls).toHaveLength(1)
    expect(connections.userCalls[0]?.userId).toBe(request.userId)
    expect(connections.userCalls[0]?.message.type).toBe(RealtimeMessageType.RequestApproved)
    expect(connections.userCalls[0]?.message.request.status).toBe(VacationStatus.Approved)
    expect(connections.roleCalls).toHaveLength(0)
  })

  it('sends rejected events to the requester', async () => {
    request.reject('Dates conflict with team coverage')
    const event = new VacationRequestRejected(request.id, request.userId, 'Dates conflict with team coverage')

    await subscriber.handle(event)

    expect(connections.userCalls).toHaveLength(1)
    expect(connections.userCalls[0]?.message.type).toBe(RealtimeMessageType.RequestRejected)
    expect(connections.userCalls[0]?.message.request.comments).toBe('Dates conflict with team coverage')
  })

  it('ignores events when the request no longer exists', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null)
    const event = new VacationRequestSubmitted(
      request.id,
      request.userId,
      '2026-07-01',
      '2026-07-05',
    )

    await subscriber.handle(event)

    expect(connections.roleCalls).toHaveLength(0)
    expect(connections.userCalls).toHaveLength(0)
  })
})
