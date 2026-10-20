'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import { cn } from '@/lib/utils'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const offset = (direction: Direction, distance: number) => ({
  x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
  y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
})

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  as?: 'div' | 'section' | 'li' | 'article' | 'span'
}

/** Fades content in once it enters the viewport. Reduced motion keeps a plain fade. */
export function FadeIn({ children, className, delay = 0, duration = 0.6, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion()
  const Component = motion[as]
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}

export function SlideIn({
  children,
  className,
  delay = 0,
  direction = 'left',
  distance = 48,
}: RevealProps & { direction?: Direction; distance?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...(reduce ? {} : offset(direction, distance)) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

const container: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.08,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
  as?: 'div' | 'ul' | 'ol'
}) {
  const Component = motion[as]
  return (
    <Component
      className={className}
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'li' | 'article'
}) {
  const Component = motion[as]
  return (
    <Component className={cn(className)} variants={staggerItem}>
      {children}
    </Component>
  )
}
