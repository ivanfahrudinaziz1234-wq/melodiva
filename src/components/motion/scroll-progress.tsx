'use client'

import { motion, useScroll, useSpring } from 'motion/react'

/** Slim reading-progress bar at the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-primary-hover to-gold"
      style={{ scaleX }}
    />
  )
}
