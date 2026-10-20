import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/login-form'
import { getAdminContext } from '@/lib/admin/auth'
import { features } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Masuk' }

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminContext()) redirect('/admin')
  const { error } = await searchParams

  let needsMfa = false
  if (features.auth) {
    const supabase = await createClient()
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    needsMfa = !!aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2'
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-heading text-3xl font-semibold">Melodiva</p>
          <h1 className="mt-2 text-sm text-muted-foreground">Masuk ke panel admin</h1>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {features.auth ? (
            <LoginForm startWithMfa={needsMfa} linkError={error === 'link'} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Mode demo: Supabase belum dikonfigurasi. Isi variabel <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> untuk mengaktifkan login admin.
            </p>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Kembali ke situs
          </Link>
        </p>
      </div>
    </main>
  )
}
