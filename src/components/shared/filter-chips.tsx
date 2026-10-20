'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

/** Accessible single-select chip group with an animated active pill. */
export function FilterChips({
  options,
  value,
  onChange,
  label,
  id,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  label: string
  id: string
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors',
              active ? 'border-primary text-primary-foreground' : 'border-border hover:bg-accent',
            )}
          >
            {active && <motion.span layoutId={`chip-${id}`} className="absolute inset-0 -z-0 rounded-full bg-primary" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
