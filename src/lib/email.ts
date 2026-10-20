import 'server-only'
import type { ReactElement } from 'react'
import { Resend } from 'resend'
import { env, features } from '@/lib/env'

let resend: Resend | undefined

type SendArgs = { to: string | string[]; subject: string; react: ReactElement; replyTo?: string }

/** Sends an email via Resend. Never throws: returns { ok, id?, error? } so callers can log status. */
export async function sendEmail({ to, subject, react, replyTo }: SendArgs) {
  if (!features.email) return { ok: false as const, error: 'not_configured' }
  try {
    resend ??= new Resend(env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM!,
      to,
      subject,
      react,
      replyTo: replyTo ?? env.EMAIL_REPLY_TO,
    })
    if (error) {
      console.error('[email] send failed', error.message)
      return { ok: false as const, error: error.message }
    }
    return { ok: true as const, id: data?.id }
  } catch (error) {
    console.error('[email] send threw', error)
    return { ok: false as const, error: 'exception' }
  }
}
