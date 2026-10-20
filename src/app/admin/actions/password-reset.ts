'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { features } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security/rate-limit'
import { hashIp } from '@/lib/security/request'
import type { ActionState } from '@/lib/admin/constants'

const GENERIC_SENT = 'Jika email terdaftar sebagai admin, tautan atur ulang kata sandi sudah dikirim.'

async function requestOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? '')
}

export async function requestPasswordResetAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!features.auth) return { error: 'Supabase belum dikonfigurasi (mode demo).' }

  const parsed = z.string().trim().toLowerCase().email('Email tidak valid.').safeParse(formData.get('email'))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const ipHash = hashIp(await headers())
  if (!(await rateLimit(`reset:${ipHash}`, 3, 60 * 60))) {
    return { error: 'Terlalu banyak permintaan. Coba lagi dalam 1 jam.' }
  }

  const supabase = await createClient()
  const redirectTo = `${await requestOrigin()}/auth/confirm?next=/admin/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo })
  if (error) console.error('[auth] reset email failed', error.message)

  return { ok: true, message: GENERIC_SENT }
}

export async function updatePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!features.auth) return { error: 'Supabase belum dikonfigurasi (mode demo).' }

  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  if (password.length < 10) return { error: 'Kata sandi minimal 10 karakter.' }
  if (password !== confirm) return { error: 'Konfirmasi kata sandi tidak sama.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Tautan sudah kedaluwarsa. Minta tautan baru dari halaman masuk.' }

  const { data: admin } = await supabase.from('admin_users').select('id').eq('id', user.id).maybeSingle()
  if (!admin) {
    await supabase.auth.signOut()
    return { error: 'Akun ini bukan admin.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'Gagal memperbarui kata sandi. Coba lagi.' }

  await supabase.from('audit_logs').insert({
    admin_id: user.id,
    action: 'password_reset',
    entity: 'admin_user',
    entity_id: user.id,
    ip_hash: hashIp(await headers()),
  })
  await supabase.auth.signOut()
  return { ok: true, message: 'Kata sandi diperbarui. Silakan masuk dengan kata sandi baru.' }
}
