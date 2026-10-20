'use client'

import { useTheme } from 'next-themes'
import { motion } from 'motion/react'
import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

const subscribe = () => () => {}

/** Sun/moon toggle with a morphing mask; renders a neutral shell until mounted to avoid mismatch. */
export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const isDark = mounted && resolvedTheme === 'dark'
  const label = isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-border bg-card/60 px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-95',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <mask id="theme-moon-mask">
          <rect width="24" height="24" fill="white" />
          <motion.circle
            r="9"
            fill="black"
            initial={false}
            animate={{ cx: isDark ? 17 : 30, cy: isDark ? 6 : 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </mask>
        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask="url(#theme-moon-mask)"
          initial={false}
          animate={{ r: isDark ? 8 : 5 }}
          transition={{ duration: 0.4 }}
        />
        <motion.g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? -45 : 0, scale: isDark ? 0.6 : 1 }}
          style={{ originX: '12px', originY: '12px' }}
          transition={{ duration: 0.35 }}
        >
          <path d="M12 1.5v2M12 20.5v2M3.5 12h-2M22.5 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4" />
        </motion.g>
      </svg>
      {withLabel && <span>{isDark ? 'Mode terang' : 'Mode gelap'}</span>}
    </button>
  )
}
