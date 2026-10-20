import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/admin/password-reset-forms'
import { features } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Atur Ulang Kata Sandi' }

export default async function ResetPasswordPage() {
  let hasSession = false
  if (features.auth) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    hasSession = !!user
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-heading text-3xl font-semibold">Melodiva</p>
          <h1 className="mt-2 text-sm text-muted-foreground">Buat kata sandi baru</h1>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {hasSession ? (
            <ResetPasswordForm />
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru melalui &quot;Lupa kata sandi?&quot; di
              halaman masuk.
            </p>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/admin/login" className="underline-offset-4 hover:underline">
            Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    </main>
  )
}
