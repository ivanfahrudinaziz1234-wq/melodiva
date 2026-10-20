'use client'

import Script from 'next/script'
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export type TurnstileHandle = { reset: () => void }

export function TurnstileWidget({
  siteKey,
  onToken,
  ref,
}: {
  siteKey: string
  onToken: (token: string | undefined) => void
  ref?: React.Ref<TurnstileHandle>
}) {
  const container = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const [loaded, setLoaded] = useState(() => typeof window !== 'undefined' && !!window.turnstile)

  const render = useCallback(() => {
    if (!container.current || !window.turnstile || widgetId.current) return
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      language: 'id',
      callback: (token: string) => onToken(token),
      'expired-callback': () => onToken(undefined),
      'error-callback': () => onToken(undefined),
    })
  }, [siteKey, onToken])

  useEffect(() => {
    if (loaded) render()
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
      widgetId.current = null
    }
  }, [loaded, render])

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current)
      onToken(undefined)
    },
  }))

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="lazyOnload" onReady={() => setLoaded(true)} />
      <div ref={container} className="min-h-[65px]" />
    </>
  )
}
