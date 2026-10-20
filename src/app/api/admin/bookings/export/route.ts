import { NextResponse } from 'next/server'
import { getAdminContext, logAudit } from '@/lib/admin/auth'
import { csvCell } from '@/lib/security/sanitize'
import { jakartaDay } from '@/lib/admin/dates'

export const dynamic = 'force-dynamic'

const columns = [
  'event_date',
  'start_time',
  'client_name',
  'whatsapp',
  'event_type',
  'package_slug',
  'venue',
  'lineup',
  'status',
  'agreed_price',
  'payment_notes',
  'notes',
  'created_at',
] as const

export async function GET() {
  const ctx = await getAdminContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await ctx.supabase.from('bookings').select(columns.join(',')).order('event_date').limit(10000)
  if (error) return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })

  const rows = (data ?? []) as unknown as Record<string, unknown>[]
  const csv = [columns.join(','), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(','))].join('\r\n')

  await logAudit(ctx, 'booking_export', 'booking', null, { rows: rows.length })

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="melodiva-booking-${jakartaDay()}.csv"`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
