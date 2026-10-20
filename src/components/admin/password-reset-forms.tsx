'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SubmitButton, FormMessage } from '@/components/admin/submit-button'
import { PasswordInput } from '@/components/admin/password-input'
import { requestPasswordResetAction, updatePasswordAction } from '@/app/admin/actions/password-reset'
import type { ActionState } from '@/lib/admin/constants'

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(requestPasswordResetAction, {})

  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Masukkan email admin Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input id="reset-email" name="email" type="email" autoComplete="email" required autoFocus />
      </div>
      <FormMessage state={state} />
      <SubmitButton size="lg" pendingText="Mengirim...">
        Kirim tautan
      </SubmitButton>
      <button type="button" onClick={onBack} className="min-h-11 text-sm text-muted-foreground underline-offset-4 hover:underline">
        Kembali ke halaman masuk
      </button>
    </form>
  )
}

export function ResetPasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(updatePasswordAction, {})

  if (state.ok) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage state={state} />
        <Link
          href="/admin/login"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Ke halaman masuk
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-password">Kata sandi baru</Label>
        <PasswordInput id="new-password" name="password" autoComplete="new-password" minLength={10} required />
        <p className="text-xs text-muted-foreground">Minimal 10 karakter.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">Ulangi kata sandi</Label>
        <PasswordInput id="confirm-password" name="confirm" autoComplete="new-password" minLength={10} required />
      </div>
      <FormMessage state={state} />
      <SubmitButton size="lg" pendingText="Menyimpan...">
        Simpan kata sandi
      </SubmitButton>
    </form>
  )
}
