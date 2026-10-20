import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin/auth'
import { features } from '@/lib/env'
import type { ReplyTemplate } from '@/lib/admin/constants'
import { PageHeader, Panel } from '@/components/admin/ui'
import { MfaSettings, PasswordForm, ProfileForm, TemplateManager } from '@/components/admin/settings-forms'

export const metadata: Metadata = { title: 'Pengaturan' }

export default async function SettingsPage() {
  const ctx = await requireAdmin()
  const [{ data: factors }, { data: templates }] = await Promise.all([
    ctx.supabase.auth.mfa.listFactors(),
    ctx.supabase.from('reply_templates').select('id, title, subject, body').order('title'),
  ])
  const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified') ?? null

  const integrations = [
    { label: 'Supabase (database & login)', on: features.auth },
    { label: 'Resend (email)', on: features.email },
    { label: 'Cloudflare Turnstile (anti-bot)', on: features.turnstile },
    { label: 'Upstash Redis (rate limit)', on: features.upstash },
  ]

  return (
    <>
      <PageHeader title="Pengaturan" description={`Masuk sebagai ${ctx.admin.email} (${ctx.admin.role}).`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Notifikasi">
          <ProfileForm notificationEmail={ctx.admin.notification_email} />
        </Panel>
        <Panel title="Verifikasi dua langkah (2FA)">
          <MfaSettings factorId={verifiedFactor?.id ?? null} />
        </Panel>
        <Panel title="Ganti kata sandi">
          <PasswordForm />
        </Panel>
        <Panel title="Status integrasi">
          <ul className="flex flex-col gap-2 text-sm">
            {integrations.map((i) => (
              <li key={i.label} className="flex items-center justify-between gap-3">
                <span>{i.label}</span>
                <span
                  className={
                    i.on
                      ? 'rounded-full bg-emerald-600/15 px-2 py-0.5 text-xs text-emerald-800 dark:text-emerald-300'
                      : 'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'
                  }
                >
                  {i.on ? 'Aktif' : 'Mode demo'}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title="Template balasan">
        <TemplateManager templates={(templates ?? []) as ReplyTemplate[]} />
      </Panel>
    </>
  )
}
