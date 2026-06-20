/**
 * Names of domain events published by the API after a successful state change.
 * Documented in the shared contract so consumers (audit, notifications, and a
 * future message broker) agree on the vocabulary, even though events are
 * currently dispatched in-process on the server only.
 */
export const DomainEventName = {
  VacationRequestSubmitted: 'VacationRequestSubmitted',
  VacationRequestApproved: 'VacationRequestApproved',
  VacationRequestRejected: 'VacationRequestRejected',
} as const
export type DomainEventName = (typeof DomainEventName)[keyof typeof DomainEventName]
