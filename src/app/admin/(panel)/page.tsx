import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requireAdmin } from '@/lib/admin/auth'
import { daysAgoIso, formatDateTime, jakartaDay, lastNDays } from '@/lib/admin/dates'
import type { Booking, Message } from '@/lib/admin/constants'
import { eventTypeLabels } from '@/lib/content'
import { formatDateId } from '@/lib/utils'
import { BarList, EmptyState, PageHeader, Panel, StatCard, StatusPill } from '@/components/admin/ui'
import { TrendChart } from '@/components/admin/trend-chart'
import { DonutChart, WeeklyBarChart } from '@/components/admin/charts'
import { sourceLabels, tally } from '@/lib/admin/analytics'

export const metadata: Metadata = { title: 'Dashboard' }

const WEEKS = 8

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin()
  const since = daysAgoIso(30)
  const today = jakartaDay()

  const [newCount, recentMessages, messageDates, views, upcoming] = await Promise.all([
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('messages')
      .select('id, ref_code, name, event_type, status, created_at, is_read')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('messages').select('created_at').gte('created_at', daysAgoIso(WEEKS * 7)).limit(10000),
    supabase
      .from('page_views')
      .select('created_at, visitor_hash, path, referrer_source')
      .eq('is_bot', false)
      .gte('created_at', since)
      .limit(50000),
    supabase
      .from('bookings')
      .select('id, client_name, event_type, event_date, start_time, venue, status')
      .gte('event_date', today)
      .neq('status', 'cancelled')
      .order('event_date')
      .limit(6),
  ])

  const days = lastNDays(30)
  const msgByDay = new Map<string, number>()
  for (const m of messageDates.data ?? []) msgByDay.set(jakartaDay(m.created_at), (msgByDay.get(jakartaDay(m.created_at)) ?? 0) + 1)
  const viewByDay = new Map<string, number>()
  for (const v of views.data ?? []) viewByDay.set(jakartaDay(v.created_at), (viewByDay.get(jakartaDay(v.created_at)) ?? 0) + 1)
  const chartData = days.map((d) => ({ label: d.label, views: viewByDay.get(d.key) ?? 0, messages: msgByDay.get(d.key) ?? 0 }))

  const viewRows = views.data ?? []
  const visitorsToday = new Set(viewRows.filter((v) => jakartaDay(v.created_at) === today).map((v) => v.visitor_hash)).size
  const visitors30d = new Set(viewRows.map((v) => v.visitor_hash)).size
  const messages30d = (messageDates.data ?? []).filter((m) => m.created_at >= since).length

  const now = Date.now()
  const weekly = Array.from({ length: WEEKS }, (_, i) => {
    const end = now - (WEEKS - 1 - i) * 7 * 86_400_000
    const start = end - 7 * 86_400_000
    const value = (messageDates.data ?? []).filter((m) => {
      const t = new Date(m.created_at).getTime()
      return t > start && t <= end
    }).length
    return { label: i === WEEKS - 1 ? 'Minggu ini' : `-${WEEKS - 1 - i} mg`, value }
  })

  const topPages = tally(viewRows, (v) => v.path, 5)
  const sources = tally(viewRows, (v) => sourceLabels[v.referrer_source] ?? v.referrer_source, 5)

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan pesan, booking, dan kunjungan 30 hari terakhir." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Pesan baru" value={newCount.count ?? 0} hint="Belum ditindaklanjuti" />
        <StatCard label="Pesan 30 hari" value={messages30d} />
        <StatCard label="Pengunjung hari ini" value={visitorsToday} hint="Unik, tanpa bot" />
        <StatCard label="Pengunjung 30 hari" value={visitors30d} hint="Unik, tanpa bot" />
        <StatCard label="Booking mendatang" value={upcoming.data?.length ?? 0} hint="Belum termasuk batal" />
      </div>

      <Panel title="Tren 30 hari">
        <TrendChart
          data={chartData}
          series={[
            { key: 'views', label: 'Kunjungan', color: 'var(--chart-1)' },
            { key: 'messages', label: 'Pesan', color: 'var(--chart-2)' },
          ]}
        />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title={`Pesan per minggu (${WEEKS} minggu)`}>
          <WeeklyBarChart data={weekly} label="Pesan" />
        </Panel>
        <Panel title="Halaman teratas">
          <BarList items={topPages} total={viewRows.length} />
        </Panel>
        <Panel title="Sumber trafik">
          <DonutChart data={sources} label="sumber trafik" />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Pesan terbaru"
          action={
            <Link href="/admin/inbox" className="inline-flex items-center gap-1 text-sm text-primary-text hover:underline">
              Semua <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        >
          {(recentMessages.data ?? []).length === 0 ? (
            <EmptyState>Belum ada pesan masuk.</EmptyState>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {(recentMessages.data as Pick<Message, 'id' | 'ref_code' | 'name' | 'event_type' | 'status' | 'created_at' | 'is_read'>[]).map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/inbox/${m.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <div className="min-w-0">
                      <p className={m.is_read ? 'truncate' : 'truncate font-semibold'}>{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {eventTypeLabels[m.event_type] ?? m.event_type} · {formatDateTime(m.created_at)}
                      </p>
                    </div>
                    <StatusPill kind="message" status={m.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Booking mendatang"
          action={
            <Link href="/admin/booking" className="inline-flex items-center gap-1 text-sm text-primary-text hover:underline">
              Semua <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        >
          {(upcoming.data ?? []).length === 0 ? (
            <EmptyState>Belum ada booking mendatang.</EmptyState>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {(upcoming.data as Pick<Booking, 'id' | 'client_name' | 'event_type' | 'event_date' | 'start_time' | 'venue' | 'status'>[]).map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/booking/${b.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{b.client_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDateId(b.event_date, { dateStyle: 'medium' })}
                        {b.start_time ? ` · ${b.start_time.slice(0, 5)}` : ''}
                        {b.venue ? ` · ${b.venue}` : ''}
                      </p>
                    </div>
                    <StatusPill kind="booking" status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}
