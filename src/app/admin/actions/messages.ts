'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin, logAudit } from '@/lib/admin/auth'
import { messageStatuses, type ActionState } from '@/lib/admin/constants'
import { sendEmail } from '@/lib/email'
import { sanitizeLine, sanitizeText } from '@/lib/security/sanitize'
import { AdminReplyEmail } from '@/emails/admin-reply'

const uuid = z.string().uuid()

export async function updateMessageStatusAction(id: string, status: string): Promise<ActionState> {
  const ctx = await requireAdmin()
  const parsedId = uuid.safeParse(id)
  const parsedStatus = z.enum(messageStatuses).safeParse(status)
  if (!parsedId.success || !parsedStatus.success) return { error: 'Data tidak valid.' }

  const { error } = await ctx.supabase
    .from('messages')
    .update({ status: parsedStatus.data, is_read: parsedStatus.data !== 'new' })
    .eq('id', parsedId.data)
  if (error) return { error: 'Gagal memperbarui status.' }

  await logAudit(ctx, 'message_status', 'message', parsedId.data, { status: parsedStatus.data })
  revalidatePath('/admin', 'layout')
  return { ok: true, message: 'Status diperbarui.' }
}

export async function saveInternalNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireAdmin()
  const id = uuid.safeParse(formData.get('id'))
  if (!id.success) return { error: 'Data tidak valid.' }
  const note = sanitizeText(String(formData.get('note') ?? ''), 2000)

  const { error } = await ctx.supabase.from('messages').update({ internal_note: note || null }).eq('id', id.data)
  if (error) return { error: 'Gagal menyimpan catatan.' }

  await logAudit(ctx, 'message_note', 'message', id.data)
  revalidatePath(`/admin/inbox/${id.data}`)
  return { ok: true, message: 'Catatan tersimpan.' }
}

export async function deleteMessageAction(id: string): Promise<ActionState> {
  const ctx = await requireAdmin()
  const parsed = uuid.safeParse(id)
  if (!parsed.success) return { error: 'Data tidak valid.' }

  const { data: msg } = await ctx.supabase.from('messages').select('ref_code').eq('id', parsed.data).maybeSingle()
  const { error } = await ctx.supabase.from('messages').delete().eq('id', parsed.data)
  if (error) return { error: 'Gagal menghapus pesan.' }

  await logAudit(ctx, 'message_delete', 'message', parsed.data, { ref_code: msg?.ref_code })
  revalidatePath('/admin', 'layout')
  redirect('/admin/inbox')
}

const replySchema = z.object({
  id: uuid,
  subject: z.string().trim().min(3, 'Subjek terlalu pendek.').max(200),
  body: z.string().trim().min(10, 'Isi balasan terlalu pendek.').max(10000),
})

/** Saves the reply first, then sends; a failed send is recorded but never loses the reply. */
export async function sendReplyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireAdmin()
  const parsed = replySchema.safeParse({
    id: formData.get('id'),
    subject: formData.get('subject'),
    body: formData.get('body'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const { data: msg } = await ctx.supabase
    .from('messages')
    .select('id, ref_code, name, email')
    .eq('id', parsed.data.id)
    .maybeSingle()
  if (!msg) return { error: 'Pesan tidak ditemukan.' }

  const subject = sanitizeLine(parsed.data.subject, 200)
  const body = sanitizeText(parsed.data.body, 10000).replaceAll('{nama}', msg.name)

  const { data: reply, error: insertError } = await ctx.supabase
    .from('replies')
    .insert({ message_id: msg.id, subject, body, sent_by: ctx.admin.id, delivery_status: 'pending' })
    .select('id')
    .single()
  if (insertError || !reply) return { error: 'Gagal menyimpan balasan.' }

  const result = await sendEmail({
    to: msg.email,
    subject: `${subject} [${msg.ref_code}]`,
    react: AdminReplyEmail({ body, refCode: msg.ref_code }),
  })

  const deliveryStatus = result.ok ? 'sent' : result.error === 'not_configured' ? 'not_configured' : 'failed'
  await ctx.supabase
    .from('replies')
    .update({ delivery_status: deliveryStatus, resend_email_id: result.ok ? (result.id ?? null) : null })
    .eq('id', reply.id)
  if (result.ok) await ctx.supabase.from('messages').update({ status: 'replied', is_read: true }).eq('id', msg.id)

  await logAudit(ctx, 'reply_send', 'message', msg.id, { delivery_status: deliveryStatus })
  revalidatePath(`/admin/inbox/${msg.id}`)

  if (result.ok) return { ok: true, message: 'Balasan terkirim.' }
  if (deliveryStatus === 'not_configured') {
    return { ok: true, message: 'Balasan tersimpan, tetapi Resend belum dikonfigurasi sehingga email tidak dikirim.' }
  }
  return { error: 'Balasan tersimpan, tetapi email gagal terkirim. Coba lagi atau hubungi via WhatsApp.' }
}
