'use client'

import { useActionState, useState, useTransition } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SubmitButton, FormMessage } from '@/components/admin/submit-button'
import { ConfirmAction } from '@/components/admin/confirm-action'
import { confirmMfaEnrollAction, disableMfaAction, startMfaEnrollAction } from '@/app/admin/actions/auth'
import { changePasswordAction, deleteTemplateAction, saveProfileAction, saveTemplateAction } from '@/app/admin/actions/settings'
import type { ActionState, ReplyTemplate } from '@/lib/admin/constants'

export function ProfileForm({ notificationEmail }: { notificationEmail: string | null }) {
  const [state, action] = useActionState<ActionState, FormData>(saveProfileAction, {})
  return (
    <form action={action} className="flex flex-col gap-3">
      <Label htmlFor="notification_email">Email notifikasi pribadi</Label>
      <Input id="notification_email" name="notification_email" type="email" defaultValue={notificationEmail ?? ''} placeholder="nama@email.com" />
      <p className="text-xs text-muted-foreground">Alamat cadangan untuk akun ini. Alert pesan baru dikirim ke ADMIN_NOTIFICATION_EMAIL.</p>
      <FormMessage state={state} />
      <SubmitButton variant="outline" className="self-start" pendingText="Menyimpan...">
        Simpan
      </SubmitButton>
    </form>
  )
}

export function PasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(changePasswordAction, {})
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Kata sandi baru</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Ulangi kata sandi</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      <FormMessage state={state} />
      <SubmitButton variant="outline" className="self-start" pendingText="Memperbarui...">
        Ganti kata sandi
      </SubmitButton>
    </form>
  )
}

export function MfaSettings({ factorId }: { factorId: string | null }) {
  const [enroll, setEnroll] = useState<{ factorId: string; qr: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [pending, startTransition] = useTransition()

  if (factorId) {
    return (
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
          2FA (TOTP) aktif untuk akun ini.
        </p>
        <ConfirmAction
          title="Nonaktifkan 2FA?"
          description="Akun hanya akan dilindungi kata sandi. Anda bisa mengaktifkannya lagi kapan saja."
          confirmLabel="Nonaktifkan"
          action={() => disableMfaAction(factorId)}
          size="sm"
        >
          Nonaktifkan 2FA
        </ConfirmAction>
      </div>
    )
  }

  if (enroll) {
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          startTransition(async () => {
            const result = await confirmMfaEnrollAction(enroll.factorId, code.trim())
            if (result.error) toast.error(result.error)
            else {
              toast.success(result.message)
              setEnroll(null)
            }
          })
        }}
      >
        <p className="text-sm text-muted-foreground">Pindai QR ini dengan Google Authenticator, 1Password, atau Authy.</p>
        {/* Supabase returns the QR as an SVG data URL. */}
        <img src={enroll.qr || '/placeholder.svg'} alt="QR code 2FA" width={180} height={180} className="rounded-lg bg-white p-2" />
        <p className="text-xs text-muted-foreground">
          Atau masukkan kode manual: <code className="break-all font-mono">{enroll.secret}</code>
        </p>
        <Label htmlFor="mfa-code">Kode 6 digit</Label>
        <Input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="max-w-40 tracking-[0.3em]"
          required
        />
        <Button type="submit" className="self-start" disabled={pending} aria-busy={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          Aktifkan 2FA
        </Button>
      </form>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Opsional. Tambahkan kode autentikator saat masuk untuk keamanan ekstra.</p>
      <Button
        variant="outline"
        className="self-start"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await startMfaEnrollAction()
            if (result.error || !result.factorId) toast.error(result.error ?? 'Gagal memulai 2FA.')
            else setEnroll({ factorId: result.factorId, qr: result.qr ?? '', secret: result.secret ?? '' })
          })
        }
      >
        {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
        Siapkan 2FA
      </Button>
    </div>
  )
}

function TemplateForm({ template, onDone }: { template?: ReplyTemplate; onDone?: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const result = await saveTemplateAction(prev, fd)
    if (result.ok) {
      toast.success(result.message)
      onDone?.()
    }
    return result
  }, {})
  const prefix = template?.id ?? 'new'
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={template?.id ?? ''} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${prefix}-title`}>Judul</Label>
          <Input id={`${prefix}-title`} name="title" defaultValue={template?.title} required maxLength={100} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${prefix}-subject`}>Subjek email</Label>
          <Input id={`${prefix}-subject`} name="subject" defaultValue={template?.subject} required maxLength={200} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${prefix}-body`}>Isi</Label>
        <Textarea id={`${prefix}-body`} name="body" defaultValue={template?.body} rows={6} required maxLength={10000} />
      </div>
      {state.error && <FormMessage state={state} />}
      <SubmitButton size="sm" className="self-start" pendingText="Menyimpan...">
        {template ? 'Simpan perubahan' : 'Tambah template'}
      </SubmitButton>
    </form>
  )
}

export function TemplateManager({ templates }: { templates: ReplyTemplate[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {templates.length === 0 && <li className="p-4 text-sm text-muted-foreground">Belum ada template.</li>}
        {templates.map((t) => (
          <li key={t.id} className="flex flex-col gap-3 p-4">
            {editing === t.id ? (
              <>
                <TemplateForm template={t} onDone={() => setEditing(null)} />
                <Button variant="ghost" size="sm" className="self-start" onClick={() => setEditing(null)}>
                  Batal
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{t.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{t.subject}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(t.id)}>
                    Edit
                  </Button>
                  <ConfirmAction
                    title="Hapus template?"
                    description={`Template "${t.title}" akan dihapus permanen.`}
                    action={() => deleteTemplateAction(t.id)}
                    size="sm"
                  >
                    Hapus
                  </ConfirmAction>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="rounded-lg border border-border p-4">
          <TemplateForm onDone={() => setAdding(false)} />
        </div>
      ) : (
        <Button variant="outline" className="self-start" onClick={() => setAdding(true)}>
          Tambah template
        </Button>
      )}
    </div>
  )
}
