import { ErrorCode, type DateOnly } from '@vm/shared'
import { DomainError } from '../errors/DomainError'

/**
 * Immutable value object for a whole-day vacation interval. Dates are
 * `YYYY-MM-DD` strings, so lexicographic comparison equals chronological order.
 * Construction enforces the two date invariants; persistence rehydration skips
 * them because stored requests are historically valid and may now be in the past.
 */
export class DateRange {
  private constructor(
    readonly startDate: DateOnly,
    readonly endDate: DateOnly,
  ) {}

  static create(startDate: DateOnly, endDate: DateOnly, today: DateOnly = DateRange.today()): DateRange {
    if (endDate < startDate) {
      throw new DomainError(ErrorCode.INVALID_DATE_RANGE, 'End date must be on or after the start date')
    }
    if (startDate < today) {
      throw new DomainError(ErrorCode.PAST_DATE, 'A vacation cannot start in the past')
    }
    return new DateRange(startDate, endDate)
  }

  /** Rebuilds a range from trusted persisted data without re-validating. */
  static fromPersistence(startDate: DateOnly, endDate: DateOnly): DateRange {
    return new DateRange(startDate, endDate)
  }

  static today(): DateOnly {
    return new Date().toISOString().slice(0, 10)
  }

  /** Inclusive overlap test, used to block conflicting requests. */
  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && other.startDate <= this.endDate
  }
}
