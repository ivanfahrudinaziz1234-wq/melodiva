'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { features } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security/rate-limit'
import { hashIp, sha256 } from '@/lib/security/request'
import { requireAdmin, logAudit } from '@/lib/admin/auth'
import type { ActionState } from '@/lib/admin/constants'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email tidak valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.').max(200),
})

const GENERIC_LOGIN_ERROR = 'Email atau kata sandi salah, atau akun ini bukan admin.'

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!features.auth) return { error: 'Supabase belum dikonfigurasi (mode demo).' }

  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const ipHash = hashIp(await headers())
  const allowed = await rateLimit(`login:${ipHash}`, 8, 15 * 60)
  if (!allowed) return { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' }

  // Per-account lockout (applies to any email, so it doesn't reveal whether the account exists).
  const accountAllowed = await rateLimit(`login-acct:${sha256(parsed.data.email)}`, 6, 15 * 60)
  if (!accountAllowed) return { error: 'Akun ini dikunci sementara karena terlalu banyak percobaan. Coba lagi dalam 15 menit.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !data.user) return { error: GENERIC_LOGIN_ERROR }

  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', data.user.id).maybeSingle()
  if (!admin) {
    await supabase.auth.signOut()
    return { error: GENERIC_LOGIN_ERROR }
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') return { mfaRequired: true }

  await supabase.from('audit_logs').insert({ admin_id: data.user.id, action: 'login', entity: 'session', ip_hash: ipHash })
  redirect('/admin')
}

export async function verifyMfaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const code = String(formData.get('code') ?? '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(code)) return { mfaRequired: true, error: 'Masukkan 6 digit kode dari aplikasi autentikator.' }

  const ipHash = hashIp(await headers())
  if (!(await rateLimit(`mfa:${ipHash}`, 10, 15 * 60))) {
    return { mfaRequired: true, error: 'Terlalu banyak percobaan. Coba lagi nanti.' }
  }

  const supabase = await createClient()
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const factor = factors?.totp?.find((f) => f.status === 'verified')
  if (!factor) return { error: 'Faktor 2FA tidak ditemukan. Silakan masuk ulang.' }

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code })
  if (error) return { mfaRequired: true, error: 'Kode salah atau kedaluwarsa.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) await supabase.from('audit_logs').insert({ admin_id: user.id, action: 'login_2fa', entity: 'session', ip_hash: ipHash })
  redirect('/admin')
}

export async function logoutAction() {
  if (features.auth) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  redirect('/admin/login')
}

export async function startMfaEnrollAction(): Promise<{ factorId?: string; qr?: string; secret?: string; error?: string }> {
  const ctx = await requireAdmin()
  const { data: existing } = await ctx.supabase.auth.mfa.listFactors()
  for (const f of existing?.all ?? []) {
    if (f.factor_type === 'totp' && f.status !== 'verified') await ctx.supabase.auth.mfa.unenroll({ factorId: f.id })
  }
  const { data, error } = await ctx.supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Melodiva ${Date.now()}` })
  if (error || !data) return { error: error?.message ?? 'Gagal memulai 2FA.' }
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret }
}

export async function confirmMfaEnrollAction(factorId: string, code: string): Promise<ActionState> {
  const ctx = await requireAdmin()
  if (!/^\d{6}$/.test(code)) return { error: 'Kode harus 6 digit.' }
  const { error } = await ctx.supabase.auth.mfa.challengeAndVerify({ factorId, code })
  if (error) return { error: 'Kode salah. Coba lagi.' }
  await logAudit(ctx, 'mfa_enabled', 'admin_user', ctx.admin.id)
  return { ok: true, message: '2FA aktif.' }
}

export async function disableMfaAction(factorId: string): Promise<ActionState> {
  const ctx = await requireAdmin()
  const { error } = await ctx.supabase.auth.mfa.unenroll({ factorId })
  if (error) return { error: error.message }
  await logAudit(ctx, 'mfa_disabled', 'admin_user', ctx.admin.id)
  return { ok: true, message: '2FA dinonaktifkan.' }
}
