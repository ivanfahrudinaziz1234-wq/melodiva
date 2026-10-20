import 'server-only'
import { z } from 'zod'

/**
 * Server environment, validated with Zod. Every service var is optional so the
 * site runs in "demo mode"; features check the `features` flags before use.
 */
const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  NEXT_PUBLIC_SUPABASE_URL: optional,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional,
  SUPABASE_SERVICE_ROLE_KEY: optional,
  RESEND_API_KEY: optional,
  EMAIL_FROM: optional,
  EMAIL_REPLY_TO: optional,
  ADMIN_NOTIFICATION_EMAIL: optional,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optional,
  TURNSTILE_SECRET_KEY: optional,
  ANALYTICS_HASH_SALT: optional,
  UPSTASH_REDIS_REST_URL: optional,
  UPSTASH_REDIS_REST_TOKEN: optional,
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`)
}

export const env = parsed.data

export const features = {
  database: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY),
  auth: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  email: !!(env.RESEND_API_KEY && env.EMAIL_FROM),
  turnstile: !!(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY),
  upstash: !!(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
}

/** Salt used for privacy-preserving hashes; falls back to the service key so hashes are never unsalted. */
export const hashSalt = env.ANALYTICS_HASH_SALT ?? env.SUPABASE_SERVICE_ROLE_KEY ?? 'melodiva-demo-salt'
