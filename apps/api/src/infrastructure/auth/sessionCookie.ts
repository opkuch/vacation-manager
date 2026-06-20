import { SESSION_COOKIE_NAME } from '@vm/shared'
import { type CommonEvent } from 'commoneventframework/dist/types/commonEvent'
import { optionalEnv } from '../config/env'

const SESSION_COOKIE_PATH = '/api'

function expiresInToMaxAgeSeconds(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/i.exec(expiresIn.trim())
  if (!match) return 8 * 3600
  const amount = Number(match[1])
  switch (match[2]?.toLowerCase()) {
    case 's':
      return amount
    case 'm':
      return amount * 60
    case 'h':
      return amount * 3600
    case 'd':
      return amount * 86_400
    default:
      return 8 * 3600
  }
}

function cookieSecureFlag(): boolean {
  return optionalEnv('COOKIE_SECURE', 'false').toLowerCase() === 'true'
}

function buildCookieAttributes(maxAge: number): string[] {
  return [
    'HttpOnly',
    `Path=${SESSION_COOKIE_PATH}`,
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    ...(cookieSecureFlag() ? ['Secure'] : []),
  ]
}

/** Parses `Cookie` header values into a name → value map. */
export function parseCookieHeader(raw: string | undefined): Record<string, string> {
  if (!raw) return {}
  const cookies: Record<string, string> = {}
  for (const part of raw.split(';')) {
    const [name, ...rest] = part.split('=')
    const key = name?.trim()
    if (!key) continue
    cookies[key] = decodeURIComponent(rest.join('=').trim())
  }
  return cookies
}

export function getSessionTokenFromCookieHeader(raw: string | undefined): string | null {
  const token = parseCookieHeader(raw)[SESSION_COOKIE_NAME]
  return token || null
}

export function getSessionTokenFromEvent(event: CommonEvent): string | null {
  const raw = event.headers?.cookie ?? event.headers?.Cookie
  return getSessionTokenFromCookieHeader(raw)
}

/** Builds a `Set-Cookie` value for a new session. */
export function buildSessionCookie(token: string): string {
  const maxAge = expiresInToMaxAgeSeconds(optionalEnv('JWT_EXPIRES_IN', '8h'))
  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    ...buildCookieAttributes(maxAge),
  ].join('; ')
}

/** Builds a `Set-Cookie` value that clears the session. */
export function buildClearSessionCookie(): string {
  return [`${SESSION_COOKIE_NAME}=`, ...buildCookieAttributes(0)].join('; ')
}
