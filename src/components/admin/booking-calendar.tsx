import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Booking } from '@/lib/admin/constants'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const dotTone: Record<string, string> = {
  negotiating: 'bg-amber-500',
  tentative: 'bg-sky-500',
  deal: 'bg-emerald-600',
  done: 'bg-muted-foreground',
  cancelled: 'bg-destructive',
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function BookingCalendar({
  year,
  month,
  bookings,
  today,
  baseHref,
}: {
  year: number
  month: number
  bookings: Pick<Booking, 'id' | 'client_name' | 'event_date' | 'status' | 'start_time'>[]
  today: string
  baseHref: (ym: string) => string
}) {
  const first = new Date(Date.UTC(year, month - 1, 1))
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const lead = (first.getUTCDay() + 6) % 7
  const prev = month === 1 ? `${year - 1}-12` : `${year}-${pad(month - 1)}`
  const next = month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`
  const title = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first)

  const byDay = new Map<string, typeof bookings>()
  for (const b of bookings) byDay.set(b.event_date, [...(byDay.get(b.event_date) ?? []), b])

  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7) cells.push(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium capitalize">{title}</h2>
        <div className="flex gap-1">
          <Link href={baseHref(prev)} className={buttonVariants({ variant: 'outline', size: 'icon' })} aria-label="Bulan sebelumnya">
            <ChevronLeft />
          </Link>
          <Link href={baseHref(next)} className={buttonVariants({ variant: 'outline', size: 'icon' })} aria-label="Bulan berikutnya">
            <ChevronRight />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border text-sm">
        {weekdays.map((d) => (
          <div key={d} className="bg-muted px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="min-h-16 bg-card/50 md:min-h-24" />
          const key = `${year}-${pad(month)}-${pad(day)}`
          const items = byDay.get(key) ?? []
          const active = items.filter((b) => b.status !== 'cancelled')
          const conflict = active.length > 1
          return (
            <div
              key={key}
              className={cn('flex min-h-16 flex-col gap-1 bg-card p-1.5 md:min-h-24', conflict && 'bg-amber-500/10')}
            >
              <span
                className={cn(
                  'self-end text-xs tabular-nums',
                  key === today && 'rounded-full bg-primary px-1.5 text-primary-foreground',
                )}
              >
                {day}
              </span>
              <ul className="flex flex-col gap-0.5">
                {items.slice(0, 3).map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/admin/booking/${b.id}`}
                      className="flex items-center gap-1 truncate rounded px-1 text-xs hover:bg-muted"
                      title={b.client_name}
                    >
                      <span className={cn('size-1.5 shrink-0 rounded-full', dotTone[b.status])} aria-hidden="true" />
                      <span className={cn('hidden truncate md:inline', b.status === 'cancelled' && 'line-through')}>
                        {b.client_name}
                      </span>
                      <span className="sr-only md:hidden">{b.client_name}</span>
                    </Link>
                  </li>
                ))}
                {items.length > 3 && <li className="px-1 text-xs text-muted-foreground">+{items.length - 3}</li>}
              </ul>
              {conflict && <span className="sr-only">Bentrok jadwal</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
