'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireAdmin, logAudit } from '@/lib/admin/auth'
import { bookingStatuses, type ActionState } from '@/lib/admin/constants'
import { sanitizeLine, sanitizeText } from '@/lib/security/sanitize'

const optionalText = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? sanitizeLine(v, max) || null : null))

const bookingSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  message_id: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  client_name: z.string().trim().min(2, 'Nama klien wajib diisi.').max(120),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{8,20}$/, 'Nomor WhatsApp tidak valid.'),
  event_type: z.string().trim().min(2, 'Jenis acara wajib diisi.').max(60),
  package_slug: optionalText(60),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal acara wajib diisi.'),
  start_time: z
    .string()
    .optional()
    .transform((v) => (v && /^\d{2}:\d{2}$/.test(v) ? v : null)),
  venue: optionalText(200),
  lineup: optionalText(300),
  status: z.enum(bookingStatuses),
  agreed_price: z
    .string()
    .optional()
    .transform((v, ctx) => {
      const digits = (v ?? '').replace(/[^\d]/g, '')
      if (!digits) return null
      const n = Number(digits)
      if (!Number.isSafeInteger(n) || n > 10_000_000_000) {
        ctx.addIssue({ code: 'custom', message: 'Harga tidak valid.' })
        return z.NEVER
      }
      return n
    }),
  payment_notes: z
    .string()
    .optional()
    .transform((v) => (v ? sanitizeText(v, 1000) || null : null)),
  notes: z
    .string()
    .optional()
    .transform((v) => (v ? sanitizeText(v, 2000) || null : null)),
  confirm_conflict: z.string().optional(),
})

export async function saveBookingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await requireAdmin()
  const raw = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : '']))
  const parsed = bookingSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }

  const { id, confirm_conflict, ...values } = parsed.data

  if (values.status !== 'cancelled' && confirm_conflict !== '1') {
    let query = ctx.supabase
      .from('bookings')
      .select('client_name, status')
      .eq('event_date', values.event_date)
      .neq('status', 'cancelled')
    if (id) query = query.neq('id', id)
    const { data: conflicts } = await query
    if (conflicts && conflicts.length > 0) {
      return { conflicts: conflicts.map((c) => c.client_name as string) }
    }
  }

  const record = { ...values, message_id: values.message_id ?? null }
  const { data, error } = id
    ? await ctx.supabase.from('bookings').update(record).eq('id', id).select('id').single()
    : await ctx.supabase
        .from('bookings')
        .insert({ ...record, created_by: ctx.admin.id })
        .select('id')
        .single()
  if (error || !data) return { error: 'Gagal menyimpan booking.' }

  await logAudit(ctx, id ? 'booking_update' : 'booking_create', 'booking', data.id, {
    event_date: values.event_date,
    status: values.status,
  })
  revalidatePath('/admin', 'layout')
  redirect(`/admin/booking?saved=1`)
}

export async function deleteBookingAction(id: string): Promise<ActionState> {
  const ctx = await requireAdmin()
  const parsed = z.string().uuid().safeParse(id)
  if (!parsed.success) return { error: 'Data tidak valid.' }

  const { error } = await ctx.supabase.from('bookings').delete().eq('id', parsed.data)
  if (error) return { error: 'Gagal menghapus booking.' }

  await logAudit(ctx, 'booking_delete', 'booking', parsed.data)
  revalidatePath('/admin', 'layout')
  redirect('/admin/booking')
}
