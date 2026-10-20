'use client'

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { useState } from 'react'

export function BackToTop() {
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setVisible(v > 900))

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          whileTap={{ scale: 0.94 }}
          className="fixed right-5 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card/90 px-4 text-sm font-medium shadow-lg backdrop-blur transition-colors hover:bg-accent in-data-[menu-open=true]:hidden"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
          Ke atas
        </motion.button>
      )}
    </AnimatePresence>
  )
}
