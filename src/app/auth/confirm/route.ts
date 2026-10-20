import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { features } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_NEXT = ['/admin', '/admin/reset-password']

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const requestedNext = searchParams.get('next') ?? '/admin'
  const next = ALLOWED_NEXT.includes(requestedNext) ? requestedNext : '/admin'
  const failUrl = new URL('/admin/login?error=link', origin)

  if (!features.auth) return NextResponse.redirect(failUrl)

  const supabase = await createClient()
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error('missing token') }

  return NextResponse.redirect(error ? failUrl : new URL(next, origin))
}
