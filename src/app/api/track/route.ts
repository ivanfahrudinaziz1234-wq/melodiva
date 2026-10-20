import { NextResponse, type NextRequest } from 'next/server'
import { hashSalt } from '@/lib/env'
import { rateLimit } from '@/lib/security/rate-limit'
import { getClientIp, sha256 } from '@/lib/security/request'
import { createAdminClient } from '@/lib/supabase/admin'

const BOT_RE = /bot|crawler|spider|crawling|slurp|facebookexternalhit|preview|headless|lighthouse|curl|wget|python|axios/i

function parseDevice(ua: string) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet'
  if (/mobi|iphone|android/i.test(ua)) return 'mobile'
  return 'desktop'
}

function parseBrowser(ua: string) {
  if (/edg\//i.test(ua)) return 'Edge'
  if (/opr\/|opera/i.test(ua)) return 'Opera'
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/chrome|crios/i.test(ua)) return 'Chrome'
  if (/safari/i.test(ua)) return 'Safari'
  return 'Lainnya'
}

function parseOs(ua: string) {
  if (/windows/i.test(ua)) return 'Windows'
  if (/iphone|ipad|ios/i.test(ua)) return 'iOS'
  if (/android/i.test(ua)) return 'Android'
  if (/mac os/i.test(ua)) return 'macOS'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Lainnya'
}

function classifyReferrer(referrer: string, ownHost: string | null) {
  if (!referrer) return { source: 'direct', host: null }
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    if (ownHost && host === ownHost.replace(/^www\./, '')) return { source: 'direct', host: null }
    if (/instagram\.com$|^l\.instagram/.test(host)) return { source: 'instagram', host }
    if (/whatsapp\.(com|net)$|wa\.me$/.test(host)) return { source: 'whatsapp', host }
    if (/google\./.test(host)) return { source: 'google', host }
    return { source: 'other', host: host.slice(0, 120) }
  } catch {
    return { source: 'direct', host: null }
  }
}

function decodeHeader(value: string | null) {
  if (!value) return null
  try {
    return decodeURIComponent(value).slice(0, 80)
  } catch {
    return value.slice(0, 80)
  }
}

export async function POST(request: NextRequest) {
  const noContent = new NextResponse(null, { status: 204 })
  const headers = request.headers
  if (headers.get('dnt') === '1' || headers.get('sec-gpc') === '1') return noContent

  const ua = headers.get('user-agent') ?? ''
  if (!ua || BOT_RE.test(ua)) return noContent

  const admin = createAdminClient()
  if (!admin) return noContent

  let body: { path?: unknown; referrer?: unknown }
  try {
    body = JSON.parse(await request.text())
  } catch {
    return noContent
  }
  const path = typeof body.path === 'string' ? body.path.split('?')[0].slice(0, 200) : ''
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return noContent

  const ip = getClientIp(headers)
  const day = new Date().toISOString().slice(0, 10)
  const visitorHash = sha256(`${ip}|${ua}|${day}|${hashSalt}`)
  if (!(await rateLimit(`track:${visitorHash}`, 60, 60))) return noContent

  const halfHour = Math.floor(Date.now() / (30 * 60 * 1000))
  const { source, host } = classifyReferrer(typeof body.referrer === 'string' ? body.referrer : '', headers.get('host'))

  const { error } = await admin.from('page_views').insert({
    path,
    referrer_source: source,
    referrer_host: host,
    device: parseDevice(ua),
    browser: parseBrowser(ua),
    os: parseOs(ua),
    country: decodeHeader(headers.get('x-vercel-ip-country')),
    city: decodeHeader(headers.get('x-vercel-ip-city')),
    visitor_hash: visitorHash,
    session_hash: sha256(`${visitorHash}|${halfHour}`),
  })
  if (error) console.error('[track] insert failed', error.message)
  return noContent
}
