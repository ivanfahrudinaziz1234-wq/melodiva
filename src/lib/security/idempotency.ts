import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export const IDEMPOTENCY_WINDOW_MS = 10 * 60 * 1000

export function isValidIdempotencyKey(key: unknown): key is string {
  return typeof key === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(key)
}

/** Finds a message already created with this key in the last 10 minutes, so retries return the same result. */
export async function findRecentByIdempotencyKey(admin: SupabaseClient, key: string) {
  const since = new Date(Date.now() - IDEMPOTENCY_WINDOW_MS).toISOString()
  const { data } = await admin
    .from('messages')
    .select('id, ref_code')
    .eq('idempotency_key', key)
    .gte('created_at', since)
    .maybeSingle()
  return data as { id: string; ref_code: string } | null
}
