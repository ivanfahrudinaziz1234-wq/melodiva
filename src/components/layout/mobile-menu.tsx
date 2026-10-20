'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { SocialIcon } from '@/components/shared/social-icon'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { socials } from '@/lib/content'
import { navItems } from '@/lib/seo'
import { cn } from '@/lib/utils'

export function MobileMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    onClose()
    // Close whenever the route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!open) return
    document.body.dataset.menuOpen = 'true'
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      delete document.body.dataset.menuOpen
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-background pb-safe"
          initial={{ clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)' }}
          animate={{ clipPath: 'circle(150% at calc(100% - 3rem) 2.5rem)' }}
          exit={{ clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="container-page flex items-center justify-between py-4">
            <Logo />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium"
            >
              <X className="size-5" aria-hidden="true" />
              Tutup
            </button>
          </div>
          <nav aria-label="Navigasi seluler" className="container-page flex-1 py-6">
            <motion.ul
              className="flex flex-col"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } } }}
            >
              {navItems.map((item) => {
                const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                return (
                  <motion.li key={item.href} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-14 items-center justify-between border-b border-border font-serif text-3xl transition-colors',
                        active ? 'text-primary-text' : 'hover:text-primary-text',
                      )}
                    >
                      {item.label}
                      {active && <span className="size-2 rounded-full bg-gold" aria-hidden="true" />}
                    </Link>
                  </motion.li>
                )
              })}
            </motion.ul>
          </nav>
          <div className="container-page flex flex-col gap-5 py-6">
            <WhatsAppButton className="w-full [&>a]:w-full" />
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle withLabel />
              {socials
                .filter((s) => s.icon !== 'whatsapp')
                .map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent"
                  >
                    <SocialIcon icon={s.icon} className="size-4" />
                    {s.label}
                  </a>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
