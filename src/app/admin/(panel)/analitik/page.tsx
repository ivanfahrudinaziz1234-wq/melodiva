import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { daysAgoIso, jakartaDay, lastNDays } from '@/lib/admin/dates'
import { cn } from '@/lib/utils'
import { BarList, PageHeader, Panel, StatCard } from '@/components/admin/ui'
import { TrendChart } from '@/components/admin/trend-chart'
import { DonutChart } from '@/components/admin/charts'
import { HourHeatmap, buildHourGrid } from '@/components/admin/hour-heatmap'
import { sourceLabels, tally } from '@/lib/admin/analytics'

export const metadata: Metadata = { title: 'Analitik' }

const ranges = [7, 30, 90] as const

type View = {
  path: string
  referrer_source: string
  device: string | null
  browser: string | null
  os: string | null
  country: string | null
  city: string | null
  visitor_hash: string
  session_hash: string | null
  created_at: string
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { supabase } = await requireAdmin()
  const { days: daysParam } = await searchParams
  const days = ranges.find((r) => String(r) === daysParam) ?? 30
  const since = daysAgoIso(days)

  const [{ data: viewData }, { count: messageCount }] = await Promise.all([
    supabase
      .from('page_views')
      .select('path, referrer_source, device, browser, os, country, city, visitor_hash, session_hash, created_at')
      .eq('is_bot', false)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50000),
    supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', since).neq('status', 'spam'),
  ])

  const views = (viewData ?? []) as View[]
  const visitors = new Set(views.map((v) => v.visitor_hash)).size
  const sessions = new Set(views.map((v) => v.session_hash ?? v.visitor_hash)).size
  const conversion = visitors ? ((messageCount ?? 0) / visitors) * 100 : 0
  const pagesPerVisit = sessions ? views.length / sessions : 0

  const byDay = new Map<string, { views: number; visitors: Set<string> }>()
  for (const v of views) {
    const k = jakartaDay(v.created_at)
    const entry = byDay.get(k) ?? { views: 0, visitors: new Set<string>() }
    entry.views++
    entry.visitors.add(v.visitor_hash)
    byDay.set(k, entry)
  }
  const chartData = lastNDays(days).map((d) => ({
    label: d.label,
    views: byDay.get(d.key)?.views ?? 0,
    visitors: byDay.get(d.key)?.visitors.size ?? 0,
  }))

  return (
    <>
      <PageHeader title="Analitik" description="Data kunjungan anonim (IP di-hash, bot dan halaman admin diabaikan).">
        <nav aria-label="Rentang waktu" className="flex gap-1 rounded-lg border border-border p-1">
          {ranges.map((r) => (
            <Link
              key={r}
              href={`/admin/analitik?days=${r}`}
              aria-current={r === days ? 'page' : undefined}
              className={cn('rounded-md px-3 py-1 text-sm', r === days ? 'bg-muted font-medium' : 'text-muted-foreground')}
            >
              {r} hari
            </Link>
          ))}
        </nav>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Kunjungan" value={views.length.toLocaleString('id-ID')} />
        <StatCard label="Pengunjung unik" value={visitors.toLocaleString('id-ID')} />
        <StatCard label="Sesi" value={sessions.toLocaleString('id-ID')} />
        <StatCard label="Halaman per kunjungan" value={pagesPerVisit.toLocaleString('id-ID', { maximumFractionDigits: 1 })} hint="Rata-rata per sesi" />
        <StatCard label="Konversi ke pesan" value={`${conversion.toFixed(1)}%`} hint={`${messageCount ?? 0} pesan`} />
      </div>

      <Panel title="Kunjungan per hari">
        <TrendChart
          data={chartData}
          series={[
            { key: 'views', label: 'Kunjungan', color: 'var(--chart-1)' },
            { key: 'visitors', label: 'Pengunjung', color: 'var(--chart-3)' },
          ]}
        />
      </Panel>

      <Panel title="Jam tersibuk (WIB)">
        <HourHeatmap grid={buildHourGrid(views.map((v) => v.created_at))} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Halaman teratas">
          <BarList items={tally(views, (v) => v.path, 10)} total={views.length} />
        </Panel>
        <Panel title="Sumber kunjungan">
          <DonutChart data={tally(views, (v) => sourceLabels[v.referrer_source] ?? v.referrer_source, 5)} label="sumber kunjungan" />
        </Panel>
        <Panel title="Perangkat">
          <BarList
            items={tally(views, (v) => (v.device ? { mobile: 'Ponsel', tablet: 'Tablet', desktop: 'Desktop' }[v.device] : null))}
            total={views.length}
          />
        </Panel>
        <Panel title="Browser">
          <BarList items={tally(views, (v) => v.browser)} total={views.length} />
        </Panel>
        <Panel title="Sistem operasi">
          <BarList items={tally(views, (v) => v.os)} total={views.length} />
        </Panel>
        <Panel title="Negara">
          <BarList items={tally(views, (v) => v.country)} total={views.length} />
        </Panel>
        <Panel title="Kota" className="lg:col-span-2">
          <BarList items={tally(views, (v) => v.city, 10)} total={views.length} />
        </Panel>
      </div>
    </>
  )
}
