import 'server-only'
import { createHash } from 'node:crypto'
import { hashSalt } from '@/lib/env'

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function getClientIp(headers: Headers) {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || '0.0.0.0'
}

/** Salted IP hash; raw IPs are never stored. */
export function hashIp(headers: Headers) {
  return sha256(`${getClientIp(headers)}|${hashSalt}`)
}

/** Rejects cross-site requests to JSON route handlers (CSRF guard for non-Server-Action endpoints). */
export function isSameOrigin(headers: Headers) {
  const origin = headers.get('origin')
  const host = headers.get('x-forwarded-host') ?? headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
