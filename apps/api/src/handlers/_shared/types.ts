import { type APIGatewayProxyStructuredResultV2 } from 'commoneventframework'
import { type CommonEvent } from 'commoneventframework/dist/types/commonEvent'
import { type JwtClaims } from '@vm/shared'

export { type CommonEvent }

/** A CEF input parser: turns a raw event into typed input (or a short-circuit Response). */
export type InputParserFn = (event: CommonEvent) => unknown

/** A CEF handler. `input` is `any` only because it crosses the framework boundary. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerFn = (input: any, event: CommonEvent) => Promise<APIGatewayProxyStructuredResultV2 | object>

/** Explicit authenticated context passed to authorized handlers (no global state). */
export interface AuthContext {
  user: JwtClaims
  event: CommonEvent
}

export type AuthedHandler<I> = (
  input: I,
  ctx: AuthContext,
) => Promise<APIGatewayProxyStructuredResultV2 | object>
