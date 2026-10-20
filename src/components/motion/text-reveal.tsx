'use client'

import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Reveals text word-by-word or letter-by-letter. The full string stays in the
 * accessible name so screen readers read it once, not per fragment.
 */
export function TextReveal({
  text,
  by = 'word',
  className,
  delay = 0,
  stagger,
  as = 'span',
  animateOnMount = false,
}: {
  text: string
  by?: 'word' | 'letter'
  className?: string
  delay?: number
  stagger?: number
  as?: 'span' | 'h1' | 'h2' | 'p'
  animateOnMount?: boolean
}) {
  const reduce = useReducedMotion()
  const Component = motion[as]
  const words = text.split(' ')
  const step = stagger ?? (by === 'word' ? 0.09 : 0.025)
  const trigger = animateOnMount ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true } }

  let index = 0
  return (
    <Component
      className={cn(className)}
      aria-label={text}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: step, delayChildren: delay }}
    >
      {words.map((word, w) => (
        <span key={`${word}-${w}`} aria-hidden="true" className="inline-block whitespace-nowrap">
          {(by === 'word' ? [word] : word.split('')).map((part) => {
            const i = index++
            return (
              <motion.span
                key={i}
                className="inline-block will-change-transform"
                variants={{
                  hidden: { opacity: 0, y: reduce ? 0 : '0.5em', filter: reduce ? 'none' : 'blur(6px)' },
                  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                {part}
              </motion.span>
            )
          })}
          {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Component>
  )
}
