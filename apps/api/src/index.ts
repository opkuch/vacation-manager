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
  const { URL } = require('node:url')
  const { WebSocketServer } = require('ws')
  const { registerHandler } = require('commoneventframework')
  const devRequestListener = require('commoneventframework/dist/dev/requestListener').default
  const { getContainer } = require('./infrastructure/container')
  const { connectionManager } = require('./infrastructure/ws/ConnectionManager')
  const { getSessionTokenFromCookieHeader } = require('./infrastructure/auth/sessionCookie')

  registerHandler(handler)

  const port = Number(process.argv[3]) || Number(process.env.PORT) || 8888
  const host = process.env.HOST ?? '0.0.0.0'
  const server = http.createServer(devRequestListener)
  const wss = new WebSocketServer({ noServer: true })
  const containerPromise = getContainer()

  server.on('upgrade', (request: import('http').IncomingMessage, socket: import('stream').Duplex, head: Buffer) => {
    const pathname = new URL(request.url ?? '', `http://${request.headers.host ?? 'localhost'}`).pathname
    if (pathname !== '/ws') {
      socket.destroy()
      return
    }

    wss.handleUpgrade(request, socket, head, (ws: import('ws').WebSocket) => {
      wss.emit('connection', ws, request)
    })
  })

  wss.on('connection', (socket: import('ws').WebSocket, request: import('http').IncomingMessage) => {
    void (async () => {
      const token = getSessionTokenFromCookieHeader(request.headers.cookie)
      if (!token) {
        socket.close(4401, 'Missing session')
        return
      }

      try {
        const { tokenService } = await containerPromise
        const claims = tokenService.verify(token)
        connectionManager.register(socket, claims.sub, claims.role)
      } catch {
        socket.close(4401, 'Invalid session')
      }
    })()
  })

  server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
    console.log(`WebSocket is running on ws://${host}:${port}/ws`)
  })
}
