import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { formatDateTime } from '@/lib/admin/dates'
import { EmptyState, PageHeader } from '@/components/admin/ui'

export const metadata: Metadata = { title: 'Audit log' }

const PAGE_SIZE = 50

const actionLabels: Record<string, string> = {
  login: 'Masuk',
  login_2fa: 'Masuk (2FA)',
  message_status: 'Ubah status pesan',
  message_note: 'Catatan pesan',
  message_delete: 'Hapus pesan',
  reply_send: 'Kirim balasan',
  booking_create: 'Buat booking',
  booking_update: 'Ubah booking',
  booking_delete: 'Hapus booking',
  booking_export: 'Export booking',
  template_create: 'Buat template',
  template_update: 'Ubah template',
  template_delete: 'Hapus template',
  profile_update: 'Ubah pengaturan',
  password_change: 'Ganti kata sandi',
  mfa_enabled: 'Aktifkan 2FA',
  mfa_disabled: 'Nonaktifkan 2FA',
}

type Log = {
  id: string
  action: string
  entity: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  admin_users: { email: string } | null
}

function entityHref(entity: string, id: string | null) {
  if (!id) return null
  if (entity === 'message') return `/admin/inbox/${id}`
  if (entity === 'booking') return `/admin/booking/${id}`
  return null
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { supabase } = await requireAdmin()
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? '1', 10) || 1)

  const { data, count } = await supabase
    .from('audit_logs')
    .select('id, action, entity, entity_id, metadata, created_at, admin_users(email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const logs = (data ?? []) as unknown as Log[]
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  return (
    <>
      <PageHeader title="Audit log" description="Riwayat semua tindakan admin." />
      {logs.length === 0 ? (
        <EmptyState>Belum ada aktivitas.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Waktu</th>
                <th scope="col" className="px-4 py-2 font-medium">Admin</th>
                <th scope="col" className="px-4 py-2 font-medium">Tindakan</th>
                <th scope="col" className="px-4 py-2 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => {
                const href = entityHref(log.entity, log.entity_id)
                const meta = Object.entries(log.metadata ?? {})
                  .map(([k, v]) => `${k}: ${String(v)}`)
                  .join(', ')
                return (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">{formatDateTime(log.created_at)}</td>
                    <td className="max-w-48 truncate px-4 py-2">{log.admin_users?.email ?? '-'}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      {href ? (
                        <Link href={href} className="underline-offset-4 hover:underline">
                          {actionLabels[log.action] ?? log.action}
                        </Link>
                      ) : (
                        (actionLabels[log.action] ?? log.action)
                      )}
                    </td>
                    <td className="max-w-64 truncate px-4 py-2 text-muted-foreground">{meta || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <nav aria-label="Halaman" className="flex items-center justify-between text-sm">
          {page > 1 ? <Link href={`/admin/audit?page=${page - 1}`}>Sebelumnya</Link> : <span />}
          <span className="text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages ? <Link href={`/admin/audit?page=${page + 1}`}>Berikutnya</Link> : <span />}
        </nav>
      )}
    </>
  )
}
