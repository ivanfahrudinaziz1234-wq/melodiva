import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env, features } from '@/lib/env'

let adminClient: SupabaseClient | undefined

/** Service-role client that bypasses RLS. Server-only; returns null in demo mode. */
export function createAdminClient() {
  if (!features.database) return null
  adminClient ??= createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return adminClient
}
