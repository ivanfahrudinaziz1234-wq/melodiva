import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin/auth'
import type { Booking } from '@/lib/admin/constants'
import { eventTypeLabels, services } from '@/lib/content'
import { BookingForm } from '@/components/admin/booking-form'
import { PageHeader, Panel } from '@/components/admin/ui'

export const metadata: Metadata = { title: 'Booking baru' }

export default async function NewBookingPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { supabase } = await requireAdmin()
  const { from } = await searchParams
  let defaults: Partial<Booking> = {}

  if (from && z.string().uuid().safeParse(from).success) {
    const { data } = await supabase
      .from('messages')
      .select('id, name, whatsapp, event_type, event_date, location')
      .eq('id', from)
      .maybeSingle()
    if (data) {
      defaults = {
        message_id: data.id,
        client_name: data.name,
        whatsapp: data.whatsapp,
        event_type: data.event_type,
        event_date: data.event_date ?? '',
        venue: data.location,
      }
    }
  }

  return (
    <>
      <Link href="/admin/booking" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Booking
      </Link>
      <PageHeader title="Booking baru" description={defaults.message_id ? 'Data diisi otomatis dari pesan masuk.' : undefined} />
      <Panel>
        <BookingForm
          defaults={defaults}
          packages={services.map((s) => ({ slug: s.slug, name: s.name }))}
          eventTypes={Object.entries(eventTypeLabels).map(([value, label]) => ({ value, label }))}
        />
      </Panel>
    </>
  )
}
