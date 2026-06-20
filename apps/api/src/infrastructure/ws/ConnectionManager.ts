import { type Role, type RealtimeMessage } from '@vm/shared'
import { type WebSocket } from 'ws'

interface ClientConnection {
  readonly socket: WebSocket
  readonly userId: string
  readonly role: Role
}

/** Tracks live WebSocket clients and fans out realtime messages by role or user. */
export class ConnectionManager {
  private readonly connections = new Set<ClientConnection>()

  register(socket: WebSocket, userId: string, role: Role): void {
    const connection: ClientConnection = { socket, userId, role }
    this.connections.add(connection)

    const remove = (): void => {
      this.connections.delete(connection)
    }
    socket.on('close', remove)
    socket.on('error', remove)
  }

  broadcastToRole(role: Role, message: RealtimeMessage): void {
    const payload = JSON.stringify(message)
    for (const connection of this.connections) {
      if (connection.role !== role || connection.socket.readyState !== connection.socket.OPEN) {
        continue
      }
      connection.socket.send(payload)
    }
  }

  sendToUser(userId: string, message: RealtimeMessage): void {
    const payload = JSON.stringify(message)
    for (const connection of this.connections) {
      if (connection.userId !== userId || connection.socket.readyState !== connection.socket.OPEN) {
        continue
      }
      connection.socket.send(payload)
    }
  }

  /** Fans out to every connected client except one (e.g. the user who triggered the change). */
  broadcastExceptUser(excludedUserId: string, message: RealtimeMessage): void {
    const payload = JSON.stringify(message)
    for (const connection of this.connections) {
      if (
        connection.userId === excludedUserId ||
        connection.socket.readyState !== connection.socket.OPEN
      ) {
        continue
      }
      connection.socket.send(payload)
    }
  }
}

/** Shared instance wired by the local dev server and realtime event subscriber. */
export const connectionManager = new ConnectionManager()
