'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** Cookie-free page view beacon sent on every client-side route change. */
export function PageViewTracker() {
  const pathname = usePathname()
  const isFirst = useRef(true)

  useEffect(() => {
    if (navigator.doNotTrack === '1') return
    const referrer = isFirst.current ? document.referrer : ''
    isFirst.current = false
    const payload = JSON.stringify({ path: pathname, referrer })
    const blob = new Blob([payload], { type: 'text/plain' })
    if (!navigator.sendBeacon?.('/api/track', blob)) {
      fetch('/api/track', { method: 'POST', body: payload, keepalive: true }).catch(() => {})
    }
  }, [pathname])

  return null
}
