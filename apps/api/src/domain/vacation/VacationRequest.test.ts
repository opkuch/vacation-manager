import { describe, expect, it } from 'vitest'
import { DomainEventName, ErrorCode, VacationStatus } from '@vm/shared'
import { DomainError } from '../errors/DomainError'
import { DateRange } from './DateRange'
import { VacationRequest } from './VacationRequest'

const FUTURE = DateRange.create('2026-06-21', '2026-06-25', '2026-06-20')

function pending(): VacationRequest {
  return VacationRequest.submit({
    userId: 'u-1',
    userName: 'Ada',
    range: FUTURE,
    reason: 'Holiday',
  })
}

describe('VacationRequest state machine', () => {
  it('submits a Pending request and records a Submitted event', () => {
    const request = pending()
    expect(request.status).toBe(VacationStatus.Pending)
    const events = request.pullEvents()
    expect(events).toHaveLength(1)
    expect(events[0]?.name).toBe(DomainEventName.VacationRequestSubmitted)
  })

  it('approves a pending request and records an Approved event', () => {
    const request = pending()
    request.pullEvents()
    request.approve()
    expect(request.status).toBe(VacationStatus.Approved)
    expect(request.pullEvents()[0]?.name).toBe(DomainEventName.VacationRequestApproved)
  })

  it('rejects a pending request with a comment', () => {
    const request = pending()
    request.pullEvents()
    request.reject('Insufficient coverage')
    expect(request.status).toBe(VacationStatus.Rejected)
    expect(request.toDto().comments).toBe('Insufficient coverage')
    expect(request.pullEvents()[0]?.name).toBe(DomainEventName.VacationRequestRejected)
  })

  it('requires a non-empty comment to reject', () => {
    const request = pending()
    expect(() => request.reject('   ')).toThrowError(
      expect.objectContaining({ code: ErrorCode.REJECTION_COMMENT_REQUIRED }),
    )
    expect(request.status).toBe(VacationStatus.Pending)
  })

  it('cannot approve an already-approved request (immutability)', () => {
    const request = pending()
    request.approve()
    try {
      request.approve()
      expect.unreachable('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(DomainError)
      expect((err as DomainError).code).toBe(ErrorCode.APPROVED_IMMUTABLE)
    }
  })

  it('cannot reject an already-approved request (immutability)', () => {
    const request = pending()
    request.approve()
    expect(() => request.reject('too late')).toThrowError(
      expect.objectContaining({ code: ErrorCode.APPROVED_IMMUTABLE }),
    )
  })
})
