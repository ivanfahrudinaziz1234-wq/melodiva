import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/reset-password']

function isProtected(pathname: string) {
  if (pathname.startsWith('/api/admin')) return true
  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) return false
  return !PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function deny(request: NextRequest, response: NextResponse) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 })
  }
  const url = request.nextUrl.clone()
  url.pathname = '/admin/login'
  url.search = ''
  const redirect = NextResponse.redirect(url)
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
  return redirect
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookieOptions: { secure: process.env.NODE_ENV === 'production' },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // Must run immediately after client creation to keep the session in sync.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isProtected(request.nextUrl.pathname)) return response
  if (!user) return deny(request, response)

  const { data: adminRow } = await supabase.from('admin_users').select('id').eq('id', user.id).maybeSingle()
  if (!adminRow) return deny(request, response)

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') return deny(request, response)

  return response
}
