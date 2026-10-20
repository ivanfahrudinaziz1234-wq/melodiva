import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/auth'
import type { Booking } from '@/lib/admin/constants'
import { eventTypeLabels, services } from '@/lib/content'
import { BookingForm } from '@/components/admin/booking-form'
import { ConfirmAction } from '@/components/admin/confirm-action'
import { PageHeader, Panel } from '@/components/admin/ui'
import { deleteBookingAction } from '@/app/admin/actions/bookings'

export const metadata: Metadata = { title: 'Edit booking' }

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()
  const booking = data as Booking

  return (
    <>
      <Link href="/admin/booking" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Booking
      </Link>
      <PageHeader title={booking.client_name} description="Edit detail booking.">
        {booking.message_id && (
          <Link href={`/admin/inbox/${booking.message_id}`} className="text-sm underline-offset-4 hover:underline">
            Lihat pesan asal
          </Link>
        )}
      </PageHeader>
      <Panel>
        <BookingForm
          key={booking.id}
          defaults={booking}
          packages={services.map((s) => ({ slug: s.slug, name: s.name }))}
          eventTypes={Object.entries(eventTypeLabels).map(([value, label]) => ({ value, label }))}
        />
      </Panel>
      <ConfirmAction
        title="Hapus booking ini?"
        description="Booking akan dihapus permanen. Jika hanya batal, ubah statusnya menjadi Batal agar riwayat tetap tersimpan."
        action={deleteBookingAction.bind(null, booking.id)}
      >
        Hapus booking
      </ConfirmAction>
    </>
  )
}
