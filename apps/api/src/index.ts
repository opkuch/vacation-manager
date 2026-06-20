import { loadEnv } from 'commoneventframework'

// Must run before importing modules that read env on load (DataSource, JwtService).
loadEnv()

// Side-effect import: registers every handler/parser referenced in root.yaml.
import './generated/HandlerRegistry'

import {
  buildCommonEvent,
  getRouteConfig,
  resolveHandlerRef,
  setLambdaContext,
  Response,
  type APIGatewayProxyStructuredResultV2,
  type Context,
} from 'commoneventframework'
import { type CommonEvent, type LambdaEvent } from 'commoneventframework/dist/types/commonEvent'
import { ErrorCode } from '@vm/shared'

/**
 * CEF transport edge. It normalizes the event, finds the route's handler/parser
 * from root.yaml, runs validation, then the handler. Handlers map their own
 * domain errors to Responses; this only guards truly unexpected failures.
 */
export const handler = async (
  event: LambdaEvent,
  context: Context,
): Promise<APIGatewayProxyStructuredResultV2> => {
  setLambdaContext(context)
  const commonEvent: CommonEvent = buildCommonEvent(event)

  try {
    const routeConfig = getRouteConfig(commonEvent)
    if (!routeConfig?.handler) {
      return new Response(404, { error: { code: ErrorCode.NOT_FOUND, message: 'Route not found' } })
    }

    const handlerFn = resolveHandlerRef(routeConfig.handler)
    if (!handlerFn) {
      return new Response(500, {
        error: { code: ErrorCode.INTERNAL, message: `Handler "${routeConfig.handler}" not found` },
      })
    }

    const parserFn = routeConfig.inputParser ? resolveHandlerRef(routeConfig.inputParser) : undefined
    const input = parserFn ? parserFn(commonEvent) : {}
    // A parser may short-circuit with a validation Response.
    if (input instanceof Response) return input

    const result = await handlerFn(input, commonEvent)
    if (result && typeof result === 'object' && 'statusCode' in result) {
      return result as APIGatewayProxyStructuredResultV2
    }
    return new Response(200, result as object)
  } catch (err) {
    console.error('[handler] unexpected error', err)
    return new Response(500, {
      error: { code: ErrorCode.INTERNAL, message: 'Internal server error' },
    })
  }
}

// Local dev server. CEF's bundled dev server hardcodes a `localhost` bind, which
// is unreachable from other containers; so we register our handler and host CEF's
// own request listener ourselves on 0.0.0.0 (HOST/PORT overridable via env/argv).
if (process.argv.includes('--local')) {
  const http = require('node:http')
  const { registerHandler } = require('commoneventframework')
  const devRequestListener = require('commoneventframework/dist/dev/requestListener').default
  registerHandler(handler)
  const port = Number(process.argv[3]) || Number(process.env.PORT) || 8888
  const host = process.env.HOST ?? '0.0.0.0'
  http.createServer(devRequestListener).listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
  })
}
