'use client'

import { useActionState, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton, FormMessage } from '@/components/admin/submit-button'
import { PasswordInput } from '@/components/admin/password-input'
import { ForgotPasswordForm } from '@/components/admin/password-reset-forms'
import { loginAction, verifyMfaAction } from '@/app/admin/actions/auth'
import type { ActionState } from '@/lib/admin/constants'

export function LoginForm({ startWithMfa = false, linkError = false }: { startWithMfa?: boolean; linkError?: boolean }) {
  const [forgot, setForgot] = useState(false)
  const [loginState, login] = useActionState<ActionState, FormData>(loginAction, { mfaRequired: startWithMfa })
  const [mfaState, verify] = useActionState<ActionState, FormData>(verifyMfaAction, {})

  if (loginState.mfaRequired) {
    return (
      <form action={verify} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="code">Kode autentikator (2FA)</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            placeholder="123456"
            className="text-center text-lg tracking-[0.4em]"
          />
          <p className="text-xs text-muted-foreground">Buka aplikasi autentikator Anda dan masukkan 6 digit kode.</p>
        </div>
        <FormMessage state={mfaState} />
        <SubmitButton size="lg" pendingText="Memverifikasi...">
          Verifikasi
        </SubmitButton>
      </form>
    )
  }

  if (forgot) return <ForgotPasswordForm onBack={() => setForgot(false)} />

  return (
    <form action={login} className="flex flex-col gap-4">
      {linkError && (
        <p role="alert" className="text-sm text-destructive">
          Tautan tidak valid atau sudah kedaluwarsa. Silakan coba lagi.
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Kata sandi</Label>
          <button
            type="button"
            onClick={() => setForgot(true)}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Lupa kata sandi?
          </button>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" required minLength={6} />
      </div>
      <FormMessage state={loginState} />
      <SubmitButton size="lg" pendingText="Masuk...">
        Masuk
      </SubmitButton>
    </form>
  )
}
