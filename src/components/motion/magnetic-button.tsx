'use client'

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/** Wrapper that gently pulls its child toward the cursor, plus a ripple on press. */
export function MagneticButton({
  children,
  className,
  strength = 0.25,
}: {
  children: React.ReactNode
  className?: string
  strength?: number
}) {
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * strength)
    y.set((e.clientY - rect.top - rect.height / 2) * strength)
  }

  return (
    <motion.div
      className={cn('inline-flex', className)}
      style={{ x, y }}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <Ripple>{children}</Ripple>
    </motion.div>
  )
}

/** Adds a material-style ripple to any primary button/link it wraps. */
export function Ripple({ children, className }: { children: React.ReactNode; className?: string }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([])

  function onPointerDown(e: React.PointerEvent<HTMLSpanElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const ripple = { id: e.timeStamp, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size }
    setRipples((r) => [...r, ripple])
    window.setTimeout(() => setRipples((r) => r.filter((item) => item.id !== ripple.id)), 600)
  }

  return (
    <span className={cn('relative inline-flex overflow-hidden rounded-full', className)} onPointerDown={onPointerDown}>
      {children}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-white/30"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </span>
  )
}
