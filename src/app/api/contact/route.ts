import { randomInt } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { AdminAlertEmail } from '@/emails/admin-alert'
import { SenderConfirmationEmail } from '@/emails/sender-confirmation'
import { eventTypeLabels, site } from '@/lib/content'
import { sendEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { findRecentByIdempotencyKey } from '@/lib/security/idempotency'
import { rateLimit } from '@/lib/security/rate-limit'
import { getClientIp, hashIp, isSameOrigin } from '@/lib/security/request'
import { sanitizeLine, sanitizeText } from '@/lib/security/sanitize'
import { verifyTurnstile } from '@/lib/security/turnstile'
import { createAdminClient } from '@/lib/supabase/admin'
import { siteUrl } from '@/lib/utils'
import { contactRequestSchema } from '@/lib/validators/contact'
import { normalizeIndonesianPhone, waReferenceLink } from '@/lib/whatsapp'

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeRefCode() {
  const now = new Date()
  const date = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`
  const suffix = Array.from({ length: 4 }, () => REF_ALPHABET[randomInt(REF_ALPHABET.length)]).join('')
  return `MLD-${date}-${suffix}`
}

const fail = (error: string, status: number, fieldErrors?: Record<string, string[]>) =>
  NextResponse.json({ ok: false, error, fieldErrors }, { status })

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request.headers)) return fail('Permintaan tidak valid.', 403)

  const admin = createAdminClient()
  if (!admin) return fail('Formulir belum dikonfigurasi. Silakan hubungi kami lewat WhatsApp.', 503)

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return fail('Permintaan tidak valid.', 400)
  }

  const parsed = contactRequestSchema.safeParse(json)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      ;(fieldErrors[key] ??= []).push(issue.message)
    }
    return fail('Mohon periksa kembali isian Anda.', 422, fieldErrors)
  }
  const input = parsed.data

  const existing = await findRecentByIdempotencyKey(admin, input.idempotencyKey)
  if (existing) return NextResponse.json({ ok: true, refCode: existing.ref_code })

  // Honeypot: pretend success so bots learn nothing.
  if (input.website) return NextResponse.json({ ok: true, refCode: makeRefCode() })

  const ipHash = hashIp(request.headers)
  if (!(await rateLimit(`contact:${ipHash}`, 5, 3600))) {
    return fail('Terlalu banyak pesan dalam waktu singkat. Silakan coba lagi nanti atau hubungi kami via WhatsApp.', 429)
  }

  if (!(await verifyTurnstile(input.turnstileToken, getClientIp(request.headers)))) {
    return fail('Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.', 400)
  }

  const record = {
    name: sanitizeLine(input.name, 80),
    whatsapp: normalizeIndonesianPhone(input.whatsapp),
    email: sanitizeLine(input.email, 120).toLowerCase(),
    event_type: input.eventType,
    event_date: input.eventDate || null,
    location: input.location ? sanitizeLine(input.location, 120) : null,
    guests: input.guests ? Number(input.guests) : null,
    message: sanitizeText(input.message, 1000),
    ip_hash: ipHash,
    user_agent: sanitizeLine(request.headers.get('user-agent') ?? '', 300),
    idempotency_key: input.idempotencyKey,
  }

  let inserted: { id: string; ref_code: string } | null = null
  for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
    const { data, error } = await admin
      .from('messages')
      .insert({ ...record, ref_code: makeRefCode() })
      .select('id, ref_code')
      .single()
    if (!error) {
      inserted = data
      break
    }
    if (error.code === '23505' && error.message.includes('idempotency_key')) {
      const dup = await findRecentByIdempotencyKey(admin, input.idempotencyKey)
      if (dup) return NextResponse.json({ ok: true, refCode: dup.ref_code })
    }
    if (error.code !== '23505') {
      console.error('[contact] insert failed', error.message)
      return fail('Pesan gagal terkirim. Silakan coba lagi sebentar lagi.', 500)
    }
  }
  if (!inserted) return fail('Pesan gagal terkirim. Silakan coba lagi sebentar lagi.', 500)

  const summary = {
    refCode: inserted.ref_code,
    name: record.name,
    whatsapp: record.whatsapp,
    email: record.email,
    eventType: eventTypeLabels[record.event_type] ?? record.event_type,
    eventDate: record.event_date,
    location: record.location,
    guests: record.guests,
    message: record.message,
  }

  const { data: admins } = await admin.from('admin_users').select('notification_email').not('notification_email', 'is', null)
  const recipients = [
    ...new Set([...(admins ?? []).map((a) => a.notification_email as string), env.ADMIN_NOTIFICATION_EMAIL].filter(Boolean) as string[]),
  ]

  const [adminResult, senderResult] = await Promise.all([
    recipients.length
      ? sendEmail({
          to: recipients,
          subject: `Pesan baru dari ${record.name}`,
          react: AdminAlertEmail({ data: summary, adminUrl: `${siteUrl}/admin/inbox/${inserted.id}` }),
          replyTo: record.email,
        })
      : Promise.resolve({ ok: false as const, error: 'no_recipient' }),
    sendEmail({
      to: record.email,
      subject: 'Pesan Anda sudah kami terima',
      react: SenderConfirmationEmail({ data: summary, replyTime: site.replyTime, waUrl: waReferenceLink(inserted.ref_code) }),
    }),
  ])

  const emailStatus = `admin:${adminResult.ok ? 'sent' : adminResult.error};sender:${senderResult.ok ? 'sent' : senderResult.error}`
  await admin.from('messages').update({ email_status: emailStatus }).eq('id', inserted.id)

  return NextResponse.json({ ok: true, refCode: inserted.ref_code })
}
