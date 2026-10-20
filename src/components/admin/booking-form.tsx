'use client'

import { useActionState, useRef } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SubmitButton, FormMessage } from '@/components/admin/submit-button'
import { saveBookingAction } from '@/app/admin/actions/bookings'
import { bookingStatusLabels, bookingStatuses, type ActionState, type Booking } from '@/lib/admin/constants'

const selectClass =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

type Defaults = Partial<Booking>

function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function BookingForm({
  defaults,
  packages,
  eventTypes,
}: {
  defaults: Defaults
  packages: { slug: string; name: string }[]
  eventTypes: { value: string; label: string }[]
}) {
  const [state, action] = useActionState<ActionState, FormData>(saveBookingAction, {})
  const confirmRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={defaults.id ?? ''} />
      <input type="hidden" name="message_id" value={defaults.message_id ?? ''} />
      <input ref={confirmRef} type="hidden" name="confirm_conflict" defaultValue="" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama klien" htmlFor="client_name">
          <Input id="client_name" name="client_name" defaultValue={defaults.client_name ?? ''} required maxLength={120} />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp">
          <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={defaults.whatsapp ?? ''} required maxLength={20} />
        </Field>
        <Field label="Jenis acara" htmlFor="event_type">
          <select id="event_type" name="event_type" className={selectClass} defaultValue={defaults.event_type ?? 'wedding'}>
            {eventTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Paket" htmlFor="package_slug">
          <select id="package_slug" name="package_slug" className={selectClass} defaultValue={defaults.package_slug ?? ''}>
            <option value="">Belum ditentukan</option>
            {packages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tanggal acara" htmlFor="event_date">
          <Input id="event_date" name="event_date" type="date" defaultValue={defaults.event_date ?? ''} required />
        </Field>
        <Field label="Jam mulai" htmlFor="start_time">
          <Input id="start_time" name="start_time" type="time" defaultValue={defaults.start_time?.slice(0, 5) ?? ''} />
        </Field>
        <Field label="Venue / lokasi" htmlFor="venue">
          <Input id="venue" name="venue" defaultValue={defaults.venue ?? ''} maxLength={200} />
        </Field>
        <Field label="Status" htmlFor="status">
          <select id="status" name="status" className={selectClass} defaultValue={defaults.status ?? 'negotiating'}>
            {bookingStatuses.map((s) => (
              <option key={s} value={s}>
                {bookingStatusLabels[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Lineup" htmlFor="lineup" hint="Contoh: 2 vokal, keyboard, gitar, cajon">
          <Input id="lineup" name="lineup" defaultValue={defaults.lineup ?? ''} maxLength={300} />
        </Field>
        <Field label="Harga disepakati (Rp)" htmlFor="agreed_price">
          <Input
            id="agreed_price"
            name="agreed_price"
            inputMode="numeric"
            defaultValue={defaults.agreed_price != null ? String(Math.round(Number(defaults.agreed_price))) : ''}
            placeholder="5000000"
          />
        </Field>
      </div>
      <Field label="Catatan pembayaran" htmlFor="payment_notes">
        <Textarea id="payment_notes" name="payment_notes" defaultValue={defaults.payment_notes ?? ''} rows={2} maxLength={1000} />
      </Field>
      <Field label="Catatan" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={defaults.notes ?? ''} rows={3} maxLength={2000} />
      </Field>

      {state.conflicts && state.conflicts.length > 0 && (
        <div role="alert" className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <TriangleAlert className="size-4 text-amber-600" aria-hidden="true" />
            Tanggal ini sudah dipakai booking lain
          </p>
          <ul className="list-disc pl-5 text-muted-foreground">
            {state.conflicts.map((c, i) => (
              <li key={`${c}-${i}`}>{c}</li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={() => {
              if (confirmRef.current) confirmRef.current.value = '1'
              formRef.current?.requestSubmit()
            }}
          >
            Tetap simpan
          </Button>
        </div>
      )}
      <FormMessage state={state} />
      <SubmitButton size="lg" className="self-start" pendingText="Menyimpan...">
        Simpan booking
      </SubmitButton>
    </form>
  )
}
