'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin, logAudit } from '@/lib/admin/auth'
import type { ActionState } from '@/lib/admin/constants'
import { sanitizeLine, sanitizeText } from '@/lib/security/sanitize'

export async function saveProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireAdmin()
  const raw = String(formData.get('notification_email') ?? '').trim()
  const parsed = z.string().email('Email tidak valid.').or(z.literal('')).safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const { error } = await ctx.supabase
    .from('admin_users')
    .update({ notification_email: parsed.data || null })
    .eq('id', ctx.admin.id)
  if (error) return { error: 'Gagal menyimpan pengaturan.' }

  await logAudit(ctx, 'profile_update', 'admin_user', ctx.admin.id)
  revalidatePath('/admin/pengaturan')
  return { ok: true, message: 'Pengaturan tersimpan.' }
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireAdmin()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')
  if (password.length < 10) return { error: 'Kata sandi minimal 10 karakter.' }
  if (password !== confirm) return { error: 'Konfirmasi kata sandi tidak sama.' }

  const { error } = await ctx.supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  await logAudit(ctx, 'password_change', 'admin_user', ctx.admin.id)
  return { ok: true, message: 'Kata sandi diperbarui.' }
}

const templateSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  title: z.string().trim().min(2, 'Judul wajib diisi.').max(100),
  subject: z.string().trim().min(3, 'Subjek wajib diisi.').max(200),
  body: z.string().trim().min(10, 'Isi template terlalu pendek.').max(10000),
})

export async function saveTemplateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireAdmin()
  const parsed = templateSchema.safeParse({
    id: formData.get('id') ?? '',
    title: formData.get('title'),
    subject: formData.get('subject'),
    body: formData.get('body'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const { id, ...rest } = parsed.data
  const values = { title: sanitizeLine(rest.title, 100), subject: sanitizeLine(rest.subject, 200), body: sanitizeText(rest.body, 10000) }
  const { data, error } = id
    ? await ctx.supabase.from('reply_templates').update(values).eq('id', id).select('id').single()
    : await ctx.supabase.from('reply_templates').insert(values).select('id').single()
  if (error || !data) return { error: 'Gagal menyimpan template.' }

  await logAudit(ctx, id ? 'template_update' : 'template_create', 'reply_template', data.id)
  revalidatePath('/admin', 'layout')
  return { ok: true, message: 'Template tersimpan.' }
}

export async function deleteTemplateAction(id: string): Promise<ActionState> {
  const ctx = await requireAdmin()
  if (!z.string().uuid().safeParse(id).success) return { error: 'Data tidak valid.' }
  const { error } = await ctx.supabase.from('reply_templates').delete().eq('id', id)
  if (error) return { error: 'Gagal menghapus template.' }
  await logAudit(ctx, 'template_delete', 'reply_template', id)
  revalidatePath('/admin', 'layout')
  return { ok: true, message: 'Template dihapus.' }
}
