import { z } from 'zod'
import { VacationRequestDtoSchema } from './dtos.js'

/** Wire vocabulary for WebSocket push messages from API to clients. */
export const RealtimeMessageType = {
  RequestSubmitted: 'request.submitted',
  RequestApproved: 'request.approved',
  RequestRejected: 'request.rejected',
} as const
export type RealtimeMessageType = (typeof RealtimeMessageType)[keyof typeof RealtimeMessageType]

const requestPayload = z.object({
  request: VacationRequestDtoSchema,
})

export const RequestSubmittedMessageSchema = z.object({
  type: z.literal(RealtimeMessageType.RequestSubmitted),
  ...requestPayload.shape,
})
export type RequestSubmittedMessage = z.infer<typeof RequestSubmittedMessageSchema>

export const RequestApprovedMessageSchema = z.object({
  type: z.literal(RealtimeMessageType.RequestApproved),
  ...requestPayload.shape,
})
export type RequestApprovedMessage = z.infer<typeof RequestApprovedMessageSchema>

export const RequestRejectedMessageSchema = z.object({
  type: z.literal(RealtimeMessageType.RequestRejected),
  ...requestPayload.shape,
})
export type RequestRejectedMessage = z.infer<typeof RequestRejectedMessageSchema>

export const RealtimeMessageSchema = z.discriminatedUnion('type', [
  RequestSubmittedMessageSchema,
  RequestApprovedMessageSchema,
  RequestRejectedMessageSchema,
])
export type RealtimeMessage = z.infer<typeof RealtimeMessageSchema>
