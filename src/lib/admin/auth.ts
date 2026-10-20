import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { features } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { hashIp } from '@/lib/security/request'

export type AdminProfile = { id: string; email: string; role: 'owner' | 'admin'; notification_email: string | null }

/** Server-side admin check: signed in, listed in admin_users, and AAL2 when a TOTP factor exists. */
export const getAdminContext = cache(async () => {
  if (!features.auth) return null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, email, role, notification_email')
    .eq('id', user.id)
    .maybeSingle<AdminProfile>()
  if (!admin) return null

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') return null

  return { supabase, user, admin }
})

export type AdminContext = NonNullable<Awaited<ReturnType<typeof getAdminContext>>>

export async function requireAdmin() {
  const ctx = await getAdminContext()
  if (!ctx) redirect('/admin/login')
  return ctx
}

export async function logAudit(
  ctx: AdminContext,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await ctx.supabase.from('audit_logs').insert({
    admin_id: ctx.admin.id,
    action,
    entity,
    entity_id: entityId ?? null,
    metadata,
    ip_hash: hashIp(await headers()),
  })
  if (error) console.error('[audit] insert failed', error.message)
}
