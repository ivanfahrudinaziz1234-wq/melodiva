import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarPlus, Mail, MessageCircle } from 'lucide-react'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/auth'
import { formatDateTime } from '@/lib/admin/dates'
import type { Message, ReplyTemplate } from '@/lib/admin/constants'
import { eventTypeLabels } from '@/lib/content'
import { formatDateId } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Panel, StatusPill } from '@/components/admin/ui'
import { NoteForm, ReplyComposer, StatusSelect } from '@/components/admin/message-controls'
import { ConfirmAction } from '@/components/admin/confirm-action'
import { deleteMessageAction } from '@/app/admin/actions/messages'

export const metadata: Metadata = { title: 'Detail pesan' }

type Reply = { id: string; subject: string; body: string; delivery_status: string; created_at: string }

const deliveryLabels: Record<string, string> = {
  sent: 'Terkirim',
  failed: 'Gagal',
  pending: 'Menunggu',
  not_configured: 'Email belum aktif',
}

function waLink(number: string, name: string) {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  return `https://wa.me/${digits}?text=${encodeURIComponent(`Halo ${name}, terima kasih sudah menghubungi Melodiva.`)}`
}

export default async function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const { supabase } = await requireAdmin()

  const { data } = await supabase.from('messages').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()
  const message = data as Message

  if (!message.is_read) {
    await supabase
      .from('messages')
      .update({ is_read: true, ...(message.status === 'new' ? { status: 'read' } : {}) })
      .eq('id', id)
    message.is_read = true
    if (message.status === 'new') message.status = 'read'
  }

  const [{ data: replies }, { data: templates }] = await Promise.all([
    supabase.from('replies').select('id, subject, body, delivery_status, created_at').eq('message_id', id).order('created_at'),
    supabase.from('reply_templates').select('id, title, subject, body').order('title'),
  ])

  const details = [
    ['Jenis acara', eventTypeLabels[message.event_type] ?? message.event_type],
    ['Tanggal acara', message.event_date ? formatDateId(message.event_date) : '-'],
    ['Lokasi', message.location ?? '-'],
    ['Jumlah tamu', message.guests ? String(message.guests) : '-'],
    ['WhatsApp', message.whatsapp],
    ['Email', message.email],
    ['Diterima', formatDateTime(message.created_at)],
    ['Email notifikasi', message.email_status ?? '-'],
  ]

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link href="/admin/inbox" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Inbox
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold md:text-3xl">{message.name}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              {message.ref_code} <StatusPill kind="message" status={message.status} />
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={waLink(message.whatsapp, message.name)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'outline' })}
            >
              <MessageCircle aria-hidden="true" /> WhatsApp
            </a>
            <a href={`mailto:${message.email}`} className={buttonVariants({ variant: 'outline' })}>
              <Mail aria-hidden="true" /> Email
            </a>
            <Link href={`/admin/booking/new?from=${message.id}`} className={buttonVariants({ variant: 'default' })}>
              <CalendarPlus aria-hidden="true" /> Buat booking
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Panel title="Pesan">
            <p className="whitespace-pre-wrap text-pretty leading-relaxed">{message.message}</p>
          </Panel>

          <Panel title={`Riwayat balasan (${replies?.length ?? 0})`}>
            {(replies ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada balasan.</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {(replies as Reply[]).map((r) => (
                  <li key={r.id} className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{r.subject}</span>
                      <span>
                        {formatDateTime(r.created_at)} · {deliveryLabels[r.delivery_status] ?? r.delivery_status}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{r.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel title="Tulis balasan">
            <ReplyComposer
              id={message.id}
              name={message.name}
              email={message.email}
              refCode={message.ref_code}
              templates={(templates ?? []) as ReplyTemplate[]}
            />
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Detail">
            <dl className="flex flex-col gap-3 text-sm">
              {details.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel>
            <div className="flex flex-col gap-5">
              <StatusSelect id={message.id} status={message.status} />
              <NoteForm id={message.id} note={message.internal_note} />
            </div>
          </Panel>
          <ConfirmAction
            title="Hapus pesan ini?"
            description="Pesan beserta riwayat balasannya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
            action={deleteMessageAction.bind(null, message.id)}
          >
            Hapus pesan
          </ConfirmAction>
        </div>
      </div>
    </>
  )
}
