'use client'

import { motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'

/** Soft fade/rise on every route change, keyed by pathname. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
