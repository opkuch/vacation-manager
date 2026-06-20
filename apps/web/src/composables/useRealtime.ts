import { watch, type WatchStopHandle } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import {
  RealtimeMessageSchema,
  RealtimeMessageType,
  Role,
  type RealtimeMessage,
  type RequestSubmittedMessage,
} from '@vm/shared'
import { useAuthStore } from '@/stores/auth'
import { useRequestsStore } from '@/stores/requests'

const MAX_RECONNECT_MS = 30_000
/** Server-side auth rejection — retrying will not succeed until the user re-authenticates. */
const AUTH_CLOSE_CODES = new Set([4401, 1008])

function wsUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/ws`
}

function formatDateRange(start: string, end: string): string {
  return `${start} → ${end}`
}

function refreshAction(onRefresh: () => void | Promise<void>) {
  return {
    label: 'Refresh',
    onClick: () => {
      void onRefresh()
    },
  }
}

function showSubmittedToast(
  message: RequestSubmittedMessage,
  requests: ReturnType<typeof useRequestsStore>,
): void {
  const { request } = message
  const range = formatDateRange(request.startDate, request.endDate)
  toast.info(`New request from ${request.userName}`, {
    description: [range, request.reason].filter(Boolean).join(' · '),
    action: refreshAction(() => requests.refreshAll()),
  })
}

function showDecisionToast(message: RealtimeMessage): void {
  const { request } = message
  const range = formatDateRange(request.startDate, request.endDate)

  if (message.type === RealtimeMessageType.RequestApproved) {
    toast.success('Request approved', { description: range })
    return
  }

  if (message.type === RealtimeMessageType.RequestRejected) {
    toast.error('Request rejected', {
      description: request.comments ? `${range} · ${request.comments}` : range,
    })
  }
}

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempt = 0
let stopAuthWatch: WatchStopHandle | null = null
let started = false

function clearReconnect(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function disconnect(): void {
  clearReconnect()
  if (socket) {
    socket.onclose = null
    socket.close()
    socket = null
  }
  reconnectAttempt = 0
}

function scheduleReconnect(connect: () => void): void {
  clearReconnect()
  const delay = Math.min(1000 * 2 ** reconnectAttempt, MAX_RECONNECT_MS)
  reconnectAttempt += 1
  reconnectTimer = setTimeout(connect, delay)
}

function handleSubmitted(
  message: RequestSubmittedMessage,
  auth: ReturnType<typeof useAuthStore>,
  requests: ReturnType<typeof useRequestsStore>,
): void {
  if (auth.user?.id === message.request.userId) return
  if (auth.role === Role.Validator) {
    showSubmittedToast(message, requests)
  }
}

function handleMessage(
  raw: string,
  auth: ReturnType<typeof useAuthStore>,
  requests: ReturnType<typeof useRequestsStore>,
): void {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return
  }

  const result = RealtimeMessageSchema.safeParse(parsed)
  if (!result.success) return

  const message = result.data

  if (message.type === RealtimeMessageType.RequestSubmitted) {
    handleSubmitted(message, auth, requests)
    return
  }

  if (
    message.type === RealtimeMessageType.RequestApproved ||
    message.type === RealtimeMessageType.RequestRejected
  ) {
    if (auth.role === Role.Requester) {
      showDecisionToast(message)
      void requests.refreshMine()
    }
  }
}

/** Maintains a cookie-authenticated WebSocket for realtime vacation updates. */
export function useRealtime(): { connect: () => void; disconnect: () => void } {
  const auth = useAuthStore()
  const requests = useRequestsStore()
  const { isAuthenticated } = storeToRefs(auth)

  function openSocket(): void {
    if (!isAuthenticated.value) return

    disconnect()
    socket = new WebSocket(wsUrl())

    socket.onopen = () => {
      reconnectAttempt = 0
    }

    socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        handleMessage(event.data, auth, requests)
      }
    }

    socket.onclose = (event) => {
      socket = null
      if (!isAuthenticated.value) return
      if (AUTH_CLOSE_CODES.has(event.code)) return
      scheduleReconnect(openSocket)
    }
  }

  function connect(): void {
    if (started) return
    started = true

    stopAuthWatch = watch(
      isAuthenticated,
      (authenticated) => {
        if (!authenticated) {
          disconnect()
          return
        }
        openSocket()
      },
      { immediate: true },
    )
  }

  return { connect, disconnect }
}
