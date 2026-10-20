'use client'

import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { useCallback, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { eventTypeLabels } from '@/lib/content'
import { MESSAGE_MAX, contactEventTypes, contactSchema } from '@/lib/validators/contact'
import { waReferenceLink } from '@/lib/whatsapp'
import { TurnstileWidget, type TurnstileHandle } from './turnstile-widget'

type Fields = {
  name: string
  whatsapp: string
  email: string
  eventType: string
  eventDate: string
  location: string
  guests: string
  message: string
  consent: boolean
  website: string
}

const initial: Fields = {
  name: '',
  whatsapp: '',
  email: '',
  eventType: '',
  eventDate: '',
  location: '',
  guests: '',
  message: '',
  consent: false,
  website: '',
}

type Errors = Partial<Record<keyof Fields, string>>

const newKey = () => crypto.randomUUID()

export function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const id = useId()
  const [fields, setFields] = useState<Fields>(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [refCode, setRefCode] = useState<string | null>(null)
  const [token, setToken] = useState<string | undefined>()
  const idempotencyKey = useRef(newKey())
  const turnstileRef = useRef<TurnstileHandle>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const onToken = useCallback((t: string | undefined) => setToken(t), [])

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const focusFirstError = (errs: Errors) => {
    const first = (Object.keys(initial) as (keyof Fields)[]).find((k) => errs[k])
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return
    setFormError(null)

    const result = contactSchema.safeParse(fields)
    if (!result.success) {
      const errs: Errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Fields
        errs[key] ??= issue.message
      }
      setErrors(errs)
      focusFirstError(errs)
      return
    }
    if (turnstileSiteKey && !token) {
      setFormError('Mohon selesaikan verifikasi keamanan terlebih dahulu.')
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, idempotencyKey: idempotencyKey.current, turnstileToken: token }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        refCode?: string
        error?: string
        fieldErrors?: Record<string, string[]>
      }
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) {
          const errs: Errors = {}
          for (const [k, v] of Object.entries(data.fieldErrors)) errs[k as keyof Fields] = v[0]
          setErrors(errs)
          focusFirstError(errs)
        }
        setFormError(data.error ?? 'Pesan gagal terkirim. Silakan coba lagi.')
        turnstileRef.current?.reset()
        setStatus('idle')
        return
      }
      setRefCode(data.refCode ?? null)
      setStatus('success')
      setFields(initial)
      idempotencyKey.current = newKey()
    } catch {
      setFormError('Koneksi terputus. Periksa internet Anda lalu coba lagi.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center md:p-10">
        <CheckCircle2 className="size-12 text-primary-text" aria-hidden="true" />
        <h2 className="font-serif text-2xl font-semibold">Pesan Anda sudah kami terima</h2>
        <p className="prose-width text-muted-foreground">
          Terima kasih! Kami sudah mengirim email konfirmasi. Simpan nomor referensi ini untuk memudahkan percakapan.
        </p>
        {refCode && (
          <p className="rounded-xl border border-gold/60 px-5 py-3 font-mono text-lg font-semibold tracking-wider text-primary-text">{refCode}</p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {refCode && (
            <Button render={<a href={waReferenceLink(refCode)} target="_blank" rel="noopener noreferrer" />} nativeButton={false} size="lg">
              Lanjut via WhatsApp
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={() => setStatus('idle')}>
            Kirim pesan lain
          </Button>
        </div>
      </div>
    )
  }

  const fieldId = (name: keyof Fields) => `${id}-${name}`
  const describedBy = (name: keyof Fields) => (errors[name] ? `${fieldId(name)}-error` : undefined)
  const ErrorText = ({ name }: { name: keyof Fields }) =>
    errors[name] ? (
      <p id={`${fieldId(name)}-error`} className="text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null

  const submitting = status === 'submitting'

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl font-semibold">Formulir pertanyaan</h2>
        <p className="text-sm text-muted-foreground">Kolom bertanda * wajib diisi.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId('name')}>Nama *</Label>
          <Input id={fieldId('name')} name="name" autoComplete="name" value={fields.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={describedBy('name')} maxLength={80} />
          <ErrorText name="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId('whatsapp')}>Nomor WhatsApp *</Label>
          <Input id={fieldId('whatsapp')} name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" value={fields.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} aria-invalid={!!errors.whatsapp} aria-describedby={describedBy('whatsapp')} maxLength={20} />
          <ErrorText name="whatsapp" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId('email')}>Email *</Label>
          <Input id={fieldId('email')} name="email" type="email" inputMode="email" autoComplete="email" value={fields.email} onChange={(e) => set('email', e.target.value)} aria-invalid={!!errors.email} aria-describedby={describedBy('email')} maxLength={120} />
          <ErrorText name="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId('eventType')}>Jenis acara *</Label>
          <select
            id={fieldId('eventType')}
            name="eventType"
            value={fields.eventType}
            onChange={(e) => set('eventType', e.target.value)}
            aria-invalid={!!errors.eventType}
            aria-describedby={describedBy('eventType')}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
          >
            <option value="" disabled>
              Pilih jenis acara
            </option>
            {contactEventTypes.map((t) => (
              <option key={t} value={t}>
                {eventTypeLabels[t] ?? t}
              </option>
            ))}
          </select>
          <ErrorText name="eventType" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId('eventDate')}>Tanggal acara</Label>
          <Input id={fieldId('eventDate')} name="eventDate" type="date" value={fields.eventDate} onChange={(e) => set('eventDate', e.target.value)} aria-invalid={!!errors.eventDate} aria-describedby={describedBy('eventDate')} />
          <ErrorText name="eventDate" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId('guests')}>Perkiraan jumlah tamu</Label>
          <Input id={fieldId('guests')} name="guests" type="number" inputMode="numeric" min={1} max={20000} value={fields.guests} onChange={(e) => set('guests', e.target.value)} aria-invalid={!!errors.guests} aria-describedby={describedBy('guests')} />
          <ErrorText name="guests" />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor={fieldId('location')}>Lokasi / venue</Label>
          <Input id={fieldId('location')} name="location" autoComplete="off" placeholder="Contoh: Royal Ambarrukmo, Yogyakarta" value={fields.location} onChange={(e) => set('location', e.target.value)} aria-invalid={!!errors.location} aria-describedby={describedBy('location')} maxLength={120} />
          <ErrorText name="location" />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor={fieldId('message')}>Pesan *</Label>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {fields.message.length}/{MESSAGE_MAX}
            </span>
          </div>
          <Textarea id={fieldId('message')} name="message" rows={5} placeholder="Ceritakan konsep acara, durasi tampil, atau lagu yang diinginkan." value={fields.message} onChange={(e) => set('message', e.target.value)} aria-invalid={!!errors.message} aria-describedby={describedBy('message')} maxLength={MESSAGE_MAX} />
          <ErrorText name="message" />
        </div>
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor={fieldId('website')}>Website</label>
        <input id={fieldId('website')} name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <Checkbox id={fieldId('consent')} name="consent" checked={fields.consent} onCheckedChange={(v) => set('consent', v === true)} aria-invalid={!!errors.consent} aria-describedby={describedBy('consent')} className="mt-0.5" />
          <Label htmlFor={fieldId('consent')} className="text-sm leading-relaxed font-normal text-muted-foreground">
            Saya setuju data ini digunakan Melodiva untuk menghubungi saya terkait acara ini.
          </Label>
        </div>
        <ErrorText name="consent" />
      </div>

      {turnstileSiteKey && <TurnstileWidget ref={turnstileRef} siteKey={turnstileSiteKey} onToken={onToken} />}

      {formError && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="self-start">
        {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
        {submitting ? 'Mengirim...' : 'Kirim pesan'}
      </Button>
    </form>
  )
}
