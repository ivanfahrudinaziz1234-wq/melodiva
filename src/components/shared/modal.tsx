'use client'

import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

/** Accessible overlay: Escape closes, focus moves in and returns, body scroll locks. */
export function Modal({
  open,
  onClose,
  label,
  children,
  className,
  onKeyDown,
}: {
  open: boolean
  onClose: () => void
  label: string
  children: React.ReactNode
  className?: string
  onKeyDown?: (e: KeyboardEvent) => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      onKeyDown?.(e)
    }
    window.addEventListener('keydown', handle)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', handle)
      previous?.focus()
    }
  }, [open, onClose, onKeyDown])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" aria-label="Tutup" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ duration: 0.25 }}
            className={cn('relative z-10 max-h-[90dvh] w-full max-w-3xl overflow-y-auto', className)}
          >
            {children}
          </motion.div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
          >
            <X className="size-4" aria-hidden="true" />
            Tutup
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
