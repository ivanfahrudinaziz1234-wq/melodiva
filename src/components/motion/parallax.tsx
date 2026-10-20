'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

/** Scroll-linked vertical drift for images. Disabled under reduced motion. */
export function Parallax({
  children,
  className,
  strength = 60,
}: {
  children: React.ReactNode
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-strength / 2, strength / 2])

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.div style={reduce ? undefined : { y, scale: 1.12 }} className="size-full will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}
