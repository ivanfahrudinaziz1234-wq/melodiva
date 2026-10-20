import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, Plus, TriangleAlert } from 'lucide-react'
import { requireAdmin } from '@/lib/admin/auth'
import { jakartaDay } from '@/lib/admin/dates'
import { bookingStatusLabels, bookingStatuses, type Booking } from '@/lib/admin/constants'
import { eventTypeLabels } from '@/lib/content'
import { cn, formatDateId, formatRupiah } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { BookingCalendar } from '@/components/admin/booking-calendar'
import { EmptyState, PageHeader, StatusPill } from '@/components/admin/ui'

export const metadata: Metadata = { title: 'Booking' }

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { supabase } = await requireAdmin()
  const sp = await searchParams
  const view = sp.view === 'calendar' ? 'calendar' : 'list'
  const status = bookingStatuses.includes(sp.status as never) ? sp.status : undefined
  const scope = sp.scope === 'past' ? 'past' : sp.scope === 'all' ? 'all' : 'upcoming'
  const today = jakartaDay()

  const ymMatch = /^(\d{4})-(\d{2})$/.exec(sp.month ?? '')
  const [year, month] = ymMatch ? [Number(ymMatch[1]), Number(ymMatch[2])] : [Number(today.slice(0, 4)), Number(today.slice(5, 7))]

  let query = supabase
    .from('bookings')
    .select('id, client_name, whatsapp, event_type, package_slug, event_date, start_time, venue, status, agreed_price')
    .limit(500)

  if (view === 'calendar') {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10)
    query = query.gte('event_date', start).lte('event_date', end).order('event_date')
  } else {
    if (scope === 'upcoming') query = query.gte('event_date', today).order('event_date')
    else if (scope === 'past') query = query.lt('event_date', today).order('event_date', { ascending: false })
    else query = query.order('event_date', { ascending: false })
    if (status) query = query.eq('status', status)
  }

  const { data } = await query
  const bookings = (data ?? []) as Booking[]

  const activeByDate = new Map<string, number>()
  for (const b of bookings) if (b.status !== 'cancelled') activeByDate.set(b.event_date, (activeByDate.get(b.event_date) ?? 0) + 1)

  const hrefFor = (params: Record<string, string | undefined>) => {
    const merged = { view, status, scope: scope === 'upcoming' ? undefined : scope, month: sp.month, ...params }
    const next = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) if (v && !(k === 'view' && v === 'list')) next.set(k, v)
    const s = next.toString()
    return s ? `/admin/booking?${s}` : '/admin/booking'
  }

  const chip = (active: boolean) =>
    cn(
      'shrink-0 rounded-full border px-3 py-1 text-sm transition-colors',
      active ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted',
    )

  return (
    <>
      <PageHeader title="Booking" description="Catatan booking manual. Privat, hanya untuk admin.">
        <a href="/api/admin/booking/export" className={buttonVariants({ variant: 'outline' })}>
          <Download aria-hidden="true" /> Export CSV
        </a>
        <Link href="/admin/booking/new" className={buttonVariants()}>
          <Plus aria-hidden="true" /> Booking baru
        </Link>
      </PageHeader>

      {sp.saved && (
        <p role="status" className="rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-2 text-sm">
          Booking tersimpan.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border border-border p-1" role="tablist" aria-label="Tampilan">
          <Link href={hrefFor({ view: 'list' })} role="tab" aria-selected={view === 'list'} className={cn('rounded-md px-3 py-1 text-sm', view === 'list' ? 'bg-muted font-medium' : 'text-muted-foreground')}>
            Daftar
          </Link>
          <Link href={hrefFor({ view: 'calendar' })} role="tab" aria-selected={view === 'calendar'} className={cn('rounded-md px-3 py-1 text-sm', view === 'calendar' ? 'bg-muted font-medium' : 'text-muted-foreground')}>
            Kalender
          </Link>
        </div>
        {view === 'list' && (
          <nav aria-label="Filter booking" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {(['upcoming', 'past', 'all'] as const).map((s) => (
              <Link key={s} href={hrefFor({ scope: s === 'upcoming' ? undefined : s })} className={chip(scope === s)}>
                {s === 'upcoming' ? 'Mendatang' : s === 'past' ? 'Lampau' : 'Semua'}
              </Link>
            ))}
            <span className="mx-1 w-px shrink-0 bg-border" aria-hidden="true" />
            <Link href={hrefFor({ status: undefined })} className={chip(!status)}>
              Semua status
            </Link>
            {bookingStatuses.map((s) => (
              <Link key={s} href={hrefFor({ status: s })} className={chip(status === s)}>
                {bookingStatusLabels[s]}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {view === 'calendar' ? (
        <BookingCalendar
          year={year}
          month={month}
          bookings={bookings}
          today={today}
          baseHref={(ym) => hrefFor({ view: 'calendar', month: ym })}
        />
      ) : bookings.length === 0 ? (
        <EmptyState>Belum ada booking untuk filter ini.</EmptyState>
      ) : (
        <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {bookings.map((b) => {
            const conflict = b.status !== 'cancelled' && (activeByDate.get(b.event_date) ?? 0) > 1
            return (
              <li key={b.id}>
                <Link href={`/admin/booking/${b.id}`} className="flex flex-col gap-1 p-4 transition-colors hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      <span className="truncate">{b.client_name}</span>
                      {conflict && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-300">
                          <TriangleAlert className="size-3" aria-hidden="true" /> Bentrok
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDateId(b.event_date, { dateStyle: 'medium' })}
                      {b.start_time ? ` · ${b.start_time.slice(0, 5)}` : ''} · {eventTypeLabels[b.event_type] ?? b.event_type}
                      {b.venue ? ` · ${b.venue}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {b.agreed_price != null && <span className="text-sm tabular-nums">{formatRupiah(Number(b.agreed_price))}</span>}
                    <StatusPill kind="booking" status={b.status} />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
