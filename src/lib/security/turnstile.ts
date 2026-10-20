import 'server-only'
import { env, features } from '@/lib/env'

/** Verifies a Turnstile token. Skipped (returns true) when Turnstile is not configured. */
export async function verifyTurnstile(token: string | undefined, ip: string) {
  if (!features.turnstile) return true
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY!, response: token, remoteip: ip })
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch (error) {
    console.error('[turnstile] verify failed', error)
    return false
  }
}
