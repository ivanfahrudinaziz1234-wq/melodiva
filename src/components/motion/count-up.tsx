'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

/** Counts from 0 to `value` once visible. Writes directly to the DOM to avoid re-renders. */
export function CountUp({ value, suffix = '', duration = 1.8 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || !inView) return
    if (reduce) {
      node.textContent = `${value.toLocaleString('id-ID')}${suffix}`
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = `${Math.round(v).toLocaleString('id-ID')}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, value, suffix, duration, reduce])

  return (
    <span ref={ref} className="tabular-nums">
      0{suffix}
    </span>
  )
}
