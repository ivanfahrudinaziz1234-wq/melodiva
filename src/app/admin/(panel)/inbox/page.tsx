import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { requireAdmin } from '@/lib/admin/auth'
import { formatDateTime } from '@/lib/admin/dates'
import { messageStatusLabels, messageStatuses, type Message } from '@/lib/admin/constants'
import { eventTypeLabels } from '@/lib/content'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeader, StatusPill } from '@/components/admin/ui'

export const metadata: Metadata = { title: 'Inbox' }

const PAGE_SIZE = 25

export default async function InboxPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { supabase } = await requireAdmin()
  const sp = await searchParams
  const status = messageStatuses.includes(sp.status as never) ? sp.status : undefined
  const q = (sp.q ?? '').replace(/[^\p{L}\p{N}@.+\-\s]/gu, '').trim().slice(0, 80)
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)

  let query = supabase
    .from('messages')
    .select('id, ref_code, name, email, whatsapp, event_type, event_date, message, status, is_read, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  if (status) query = query.eq('status', status)
  else query = query.not('status', 'in', '(spam,archived)')
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,ref_code.ilike.%${q}%,whatsapp.ilike.%${q}%`)

  const { data, count } = await query
  const messages = (data ?? []) as Message[]
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const hrefFor = (params: Record<string, string | undefined>) => {
    const next = new URLSearchParams()
    const merged = { status, q: q || undefined, ...params }
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v)
    const s = next.toString()
    return s ? `/admin/inbox?${s}` : '/admin/inbox'
  }

  const tabs = [{ value: undefined, label: 'Aktif' }, ...messageStatuses.map((s) => ({ value: s, label: messageStatusLabels[s] }))]

  return (
    <>
      <PageHeader title="Inbox" description={`${count ?? 0} pesan`} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter status" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {tabs.map((t) => (
            <Link
              key={t.label}
              href={hrefFor({ status: t.value, page: undefined })}
              aria-current={status === t.value ? 'page' : undefined}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-sm transition-colors',
                status === t.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted',
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="q" className="sr-only">
            Cari pesan
          </label>
          <Input id="q" name="q" defaultValue={q} placeholder="Nama, email, WA, ref..." className="w-full lg:w-64" />
          <Button type="submit" variant="outline" size="icon" aria-label="Cari">
            <Search />
          </Button>
        </form>
      </div>

      {messages.length === 0 ? (
        <EmptyState>Tidak ada pesan untuk filter ini.</EmptyState>
      ) : (
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {messages.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/inbox/${m.id}`} className="flex flex-col gap-1 p-4 transition-colors hover:bg-muted/60">
                <div className="flex items-center justify-between gap-3">
                  <p className={cn('flex min-w-0 items-center gap-2 truncate', !m.is_read && 'font-semibold')}>
                    {!m.is_read && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Belum dibaca" />}
                    <span className="truncate">{m.name}</span>
                  </p>
                  <StatusPill kind="message" status={m.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {m.ref_code} · {eventTypeLabels[m.event_type] ?? m.event_type}
                  {m.event_date ? ` · acara ${m.event_date}` : ''} · {formatDateTime(m.created_at)}
                </p>
                <p className="line-clamp-1 text-sm text-muted-foreground">{m.message}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="Halaman" className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={hrefFor({ page: String(page - 1) })} className="underline-offset-4 hover:underline">
              Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={hrefFor({ page: String(page + 1) })} className="underline-offset-4 hover:underline">
              Berikutnya
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  )
}
