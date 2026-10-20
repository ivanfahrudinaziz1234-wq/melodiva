import { cn } from '@/lib/utils'
import { bookingStatusLabels, messageStatusLabels, type BookingStatus, type MessageStatus } from '@/lib/admin/constants'

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-balance md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

export function Panel({ title, children, className, action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-4 md:p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="font-medium">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

const messageTone: Record<MessageStatus, string> = {
  new: 'bg-primary text-primary-foreground',
  read: 'bg-muted text-foreground',
  replied: 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-300',
  done: 'bg-sky-600/15 text-sky-800 dark:text-sky-300',
  spam: 'bg-destructive/15 text-destructive',
  archived: 'bg-muted text-muted-foreground',
}

const bookingTone: Record<BookingStatus, string> = {
  negotiating: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  tentative: 'bg-sky-600/15 text-sky-800 dark:text-sky-300',
  deal: 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-300',
  done: 'bg-muted text-foreground',
  cancelled: 'bg-destructive/15 text-destructive line-through',
}

export function StatusPill({ kind, status }: { kind: 'message' | 'booking'; status: string }) {
  const tone = kind === 'message' ? messageTone[status as MessageStatus] : bookingTone[status as BookingStatus]
  const label =
    kind === 'message' ? messageStatusLabels[status as MessageStatus] : bookingStatusLabels[status as BookingStatus]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tone)}>{label ?? status}</span>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children}</p>
}

export function BarList({ items, total }: { items: { label: string; value: number }[]; total?: number }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (items.length === 0) return <EmptyState>Belum ada data.</EmptyState>
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.label} className="relative overflow-hidden rounded-md px-3 py-1.5 text-sm">
          <span
            className="absolute inset-y-0 left-0 rounded-md bg-primary/12"
            style={{ width: `${(item.value / max) * 100}%` }}
            aria-hidden="true"
          />
          <span className="relative flex items-center justify-between gap-3">
            <span className="truncate">{item.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {item.value}
              {total ? ` (${Math.round((item.value / total) * 100)}%)` : ''}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
