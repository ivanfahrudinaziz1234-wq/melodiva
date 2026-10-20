import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env, features } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'

const limiters = new Map<string, Ratelimit>()

function upstashLimiter(limit: number, windowSeconds: number) {
  const id = `${limit}:${windowSeconds}`
  let limiter = limiters.get(id)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! }),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: 'melodiva',
    })
    limiters.set(id, limiter)
  }
  return limiter
}

/** Returns true when the request is allowed. Uses Upstash when configured, otherwise the rate_limits table. Fails open in demo mode. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  try {
    if (features.upstash) {
      const { success } = await upstashLimiter(limit, windowSeconds).limit(key)
      return success
    }
    const admin = createAdminClient()
    if (!admin) return true
    const { data, error } = await admin.rpc('hit_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })
    if (error) {
      console.error('[rate-limit] rpc failed', error.message)
      return true
    }
    return data === true
  } catch (error) {
    console.error('[rate-limit] failed', error)
    return true
  }
}
