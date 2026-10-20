'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, MapPin } from 'lucide-react'
import { useState } from 'react'
import type { Performance } from '@/types/content'
import { FilterChips } from '@/components/shared/filter-chips'
import { formatDateId } from '@/lib/utils'

export function PerformanceList({ items, labels }: { items: Performance[]; labels: Record<string, string> }) {
  const [filter, setFilter] = useState('semua')
  const types = [...new Set(items.map((p) => p.eventType))]
  const shown = filter === 'semua' ? items : items.filter((p) => p.eventType === filter)

  return (
    <div className="flex flex-col gap-10">
      <FilterChips
        id="perf"
        label="Filter jenis acara"
        value={filter}
        onChange={setFilter}
        options={[{ value: 'semua', label: 'Semua' }, ...types.map((t) => ({ value: t, label: labels[t] ?? t }))]}
      />
      <p className="sr-only" aria-live="polite">
        {shown.length} penampilan ditampilkan
      </p>
      <motion.ul layout className="grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row"
            >
              {p.photos[0] && (
                <div className="relative aspect-[4/3] shrink-0 bg-muted sm:aspect-auto sm:w-48">
                  <Image src={p.photos[0]} alt={`Penampilan di ${p.venue}`} fill sizes="(min-width: 640px) 12rem, 100vw" className="object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-2 p-6">
                <span className="self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-text">{labels[p.eventType] ?? p.eventType}</span>
                <h2 className="font-serif text-xl font-semibold">{p.venue}</h2>
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" aria-hidden="true" />
                    {p.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    <time dateTime={p.date}>{formatDateId(p.date)}</time>
                  </span>
                </p>
                <p className="text-muted-foreground">{p.description}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  )
}
