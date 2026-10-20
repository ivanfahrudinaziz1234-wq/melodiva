import { cookies } from 'next/headers'
import { AdminBottomNav, AdminMobileBar, AdminSidebar, SIDEBAR_COOKIE } from '@/components/admin/admin-nav'
import { requireAdmin } from '@/lib/admin/auth'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin()
  const [{ count }, cookieStore] = await Promise.all([
    ctx.supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    cookies(),
  ])
  const unread = count ?? 0
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === 'collapsed'

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar unread={unread} email={ctx.admin.email} defaultCollapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileBar unread={unread} email={ctx.admin.email} />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pt-6 pb-24 md:px-8 md:py-8">{children}</main>
        <AdminBottomNav unread={unread} />
      </div>
    </div>
  )
}
