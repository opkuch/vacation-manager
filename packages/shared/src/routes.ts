import { Role } from './enums.js'

type Access = 'public' | 'authenticated' | Role

/**
 * Single source of truth for the HTTP surface. The Web app builds Axios calls
 * from these paths; the API mirrors them in `root.yaml`. `access` documents the
 * authorization each route requires so both sides stay aligned.
 *
 * Path params use the `:param` syntax expected by commoneventframework.
 */
export const API_ROUTES = {
  login: { method: 'POST', path: '/auth/login', access: 'public' },
  me: { method: 'GET', path: '/auth/me', access: 'authenticated' },

  createRequest: { method: 'POST', path: '/vacation-requests', access: Role.Requester },
  listMyRequests: { method: 'GET', path: '/vacation-requests/mine', access: Role.Requester },
  listAllRequests: { method: 'GET', path: '/vacation-requests', access: Role.Validator },
  listTeamRequests: { method: 'GET', path: '/vacation-requests/team', access: 'authenticated' },
  approveRequest: {
    method: 'POST',
    path: '/vacation-requests/:id/approve',
    access: Role.Validator,
  },
  rejectRequest: {
    method: 'POST',
    path: '/vacation-requests/:id/reject',
    access: Role.Validator,
  },
} as const satisfies Record<string, { method: string; path: string; access: Access }>

export type ApiRouteKey = keyof typeof API_ROUTES

/** Builds a concrete path by substituting `:param` placeholders. */
export const buildPath = (path: string, params: Record<string, string> = {}): string =>
  path.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
    const value = params[key]
    if (value === undefined) throw new Error(`Missing path param: ${key}`)
    return encodeURIComponent(value)
  })
