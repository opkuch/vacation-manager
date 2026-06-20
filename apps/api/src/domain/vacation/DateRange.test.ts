import { describe, expect, it } from 'vitest'
import { ErrorCode } from '@vm/shared'
import { DomainError } from '../errors/DomainError'
import { DateRange } from './DateRange'

const TODAY = '2026-06-20'

describe('DateRange', () => {
  it('creates a valid range starting today or later', () => {
    const range = DateRange.create('2026-06-21', '2026-06-25', TODAY)
    expect(range.startDate).toBe('2026-06-21')
    expect(range.endDate).toBe('2026-06-25')
  })

  it('allows a single-day range (end equals start)', () => {
    expect(() => DateRange.create('2026-06-21', '2026-06-21', TODAY)).not.toThrow()
  })

  it('rejects an end date before the start date', () => {
    expect(() => DateRange.create('2026-06-25', '2026-06-21', TODAY)).toThrowError(
      expect.objectContaining({ code: ErrorCode.INVALID_DATE_RANGE }),
    )
  })

  it('rejects a start date in the past', () => {
    try {
      DateRange.create('2026-06-19', '2026-06-25', TODAY)
      expect.unreachable('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(DomainError)
      expect((err as DomainError).code).toBe(ErrorCode.PAST_DATE)
    }
  })

  it('detects overlapping ranges inclusively', () => {
    const a = DateRange.create('2026-06-21', '2026-06-25', TODAY)
    const b = DateRange.create('2026-06-25', '2026-06-28', TODAY)
    const c = DateRange.create('2026-06-26', '2026-06-28', TODAY)
    expect(a.overlaps(b)).toBe(true)
    expect(a.overlaps(c)).toBe(false)
  })

  it('skips validation when rehydrating from persistence', () => {
    expect(() => DateRange.fromPersistence('2000-01-01', '1999-01-01')).not.toThrow()
  })
})
