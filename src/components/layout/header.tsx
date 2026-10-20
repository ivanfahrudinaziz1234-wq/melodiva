'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { SocialIcon } from '@/components/shared/social-icon'
import { navItems } from '@/lib/seo'
import { waLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

export function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function Header() {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-border bg-background/80 py-2 shadow-sm backdrop-blur-xl' : 'bg-gradient-to-b from-background/70 to-transparent py-4 backdrop-blur-[2px]',
        )}
      >
        <div className="container-page flex items-center justify-between gap-4">
          <Link href="/" aria-label="Melodiva Music — ke beranda" className="shrink-0 rounded-md">
            <Logo className={cn('origin-left transition-transform duration-300', scrolled && 'scale-90')} />
          </Link>

          <nav aria-label="Navigasi utama" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative inline-flex min-h-11 items-center rounded-full px-3 text-[0.95rem] font-medium transition-colors',
                        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-2 bottom-1.5 h-0.5 rounded-full bg-primary"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary-hover active:translate-y-0 sm:inline-flex"
            >
              <SocialIcon icon="whatsapp" className="size-4" />
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/70 px-4 text-sm font-medium xl:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
              Menu
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
    </>
  )
}
