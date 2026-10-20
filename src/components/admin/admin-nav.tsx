'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { logoutAction } from '@/app/admin/actions/auth'
import { cn } from '@/lib/utils'

export const SIDEBAR_COOKIE = 'admin_sidebar'

const links = [
  { href: '/admin', label: 'Dashboard', short: 'Beranda', icon: LayoutDashboard, primary: true },
  { href: '/admin/inbox', label: 'Inbox', short: 'Inbox', icon: Inbox, badge: true, primary: true },
  { href: '/admin/booking', label: 'Booking', short: 'Booking', icon: CalendarDays, primary: true },
  { href: '/admin/analitik', label: 'Analitik', short: 'Analitik', icon: BarChart3, primary: true },
  { href: '/admin/audit', label: 'Audit log', short: 'Audit', icon: History },
  { href: '/admin/pengaturan', label: 'Pengaturan', short: 'Atur', icon: Settings },
]

function useIsActive() {
  const pathname = usePathname()
  return (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href))
}

function UnreadBadge({ unread, active, compact }: { unread: number; active?: boolean; compact?: boolean }) {
  if (unread <= 0) return null
  return (
    <span
      className={cn(
        'rounded-full text-xs tabular-nums',
        compact ? 'absolute -top-1 -right-1 min-w-4 px-1 text-[10px] leading-4' : 'px-2 py-0.5',
        active && !compact ? 'bg-primary-foreground/20' : 'bg-primary text-primary-foreground',
      )}
    >
      {unread > 99 ? '99+' : unread}
      <span className="sr-only"> pesan belum dibaca</span>
    </span>
  )
}

function NavLinks({ unread, collapsed, onNavigate }: { unread: number; collapsed?: boolean; onNavigate?: () => void }) {
  const isActive = useIsActive()
  return (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon, badge }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              'relative flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors',
              collapsed ? 'justify-center px-2' : 'px-3',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className={cn('flex-1', collapsed && 'sr-only')}>{label}</span>
            {badge && <UnreadBadge unread={unread} active={active} compact={collapsed} />}
          </Link>
        )
      })}
    </nav>
  )
}

function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        title={collapsed ? 'Keluar' : undefined}
        className={cn('w-full gap-3 text-muted-foreground', collapsed ? 'justify-center px-2' : 'justify-start px-3')}
      >
        <LogOut className="size-4" aria-hidden="true" />
        <span className={cn(collapsed && 'sr-only')}>Keluar</span>
      </Button>
    </form>
  )
}

export function AdminSidebar({ unread, email, defaultCollapsed }: { unread: number; email: string; defaultCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    document.cookie = `${SIDEBAR_COOKIE}=${next ? 'collapsed' : 'expanded'}; path=/admin; max-age=31536000; samesite=lax`
  }

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col gap-6 border-r border-border bg-card p-4 transition-[width] duration-200 md:flex',
        collapsed ? 'w-[72px]' : 'w-60',
      )}
    >
      <div className={cn('flex items-center pt-2', collapsed ? 'justify-center' : 'justify-between px-3')}>
        {!collapsed && (
          <Link href="/admin" className="font-heading text-xl font-semibold">
            Melodiva <span className="text-sm font-normal text-muted-foreground">Admin</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={collapsed ? 'Lebarkan sidebar' : 'Ciutkan sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>
      <NavLinks unread={unread} collapsed={collapsed} />
      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
        {!collapsed && <p className="truncate px-3 text-xs text-muted-foreground">{email}</p>}
        <LogoutButton collapsed={collapsed} />
      </div>
    </aside>
  )
}

export function AdminMobileBar({ unread, email }: { unread: number; email: string }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
      <Link href="/admin" className="font-heading text-lg font-semibold">
        Melodiva <span className="text-sm font-normal text-muted-foreground">Admin</span>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Buka menu admin" />}>
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="p-4">
          <SheetHeader className="p-0">
            <SheetTitle>Menu admin</SheetTitle>
          </SheetHeader>
          <NavLinks unread={unread} onNavigate={() => setOpen(false)} />
          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
            <p className="truncate px-3 text-xs text-muted-foreground">{email}</p>
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

export function AdminBottomNav({ unread }: { unread: number }) {
  const isActive = useIsActive()
  return (
    <nav
      aria-label="Navigasi bawah admin"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="flex">
        {links
          .filter((l) => l.primary)
          .map(({ href, short, icon: Icon, badge }) => {
            const active = isActive(href)
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 text-[11px] font-medium',
                    active ? 'text-primary-text' : 'text-muted-foreground',
                  )}
                >
                  <span className="relative">
                    <Icon className="size-5" aria-hidden="true" />
                    {badge && <UnreadBadge unread={unread} compact />}
                  </span>
                  {short}
                </Link>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}
