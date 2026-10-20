'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const LOGO_SRC = '/images/logo/logo.png'

/** Heights of the piano keys that form the "M"; index 1 and 3 are the maroon keys. */
export const PIANO_M_KEYS = [
  { x: 0, h: 40, dark: false },
  { x: 9, h: 28, dark: true },
  { x: 18, h: 20, dark: false },
  { x: 27, h: 28, dark: true },
  { x: 36, h: 40, dark: false },
] as const

export function PianoMark({ className, pressed }: { className?: string; pressed?: number }) {
  return (
    <svg viewBox="0 0 44 40" className={cn('h-9 w-auto', className)} aria-hidden="true">
      {PIANO_M_KEYS.map((key, i) => (
        <rect
          key={key.x}
          x={key.x}
          y={0}
          width={8}
          height={key.h}
          rx={1.5}
          className={cn(
            'transition-transform duration-150',
            key.dark ? 'fill-primary' : 'fill-foreground',
            pressed === i && 'translate-y-[2px]',
          )}
        />
      ))}
    </svg>
  )
}

/**
 * Brand logo. Shows the SVG piano-key fallback immediately and swaps in
 * /images/logo/logo.png once it loads, so a missing file never breaks the UI.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [imageReady, setImageReady] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <span className={cn('relative inline-flex items-center gap-2.5', className)}>
      {!imageFailed && (
        // eslint-disable-next-line @next/next/no-img-element -- plain img lets us detect a missing placeholder file
        <img
          src={LOGO_SRC}
          alt="Melodiva Music"
          width={160}
          height={48}
          onLoad={() => setImageReady(true)}
          onError={() => setImageFailed(true)}
          className={cn('h-10 w-auto', imageReady ? 'block' : 'hidden')}
        />
      )}
      {!imageReady && (
        <>
          <PianoMark />
          {!compact && (
            <span className="flex flex-col leading-none">
              <span className="font-serif text-lg font-semibold tracking-[0.18em]">MELODIVA</span>
              <span className="mt-1 text-[0.6rem] font-medium tracking-[0.45em] text-gold-text">MUSIC</span>
            </span>
          )}
          <span className="sr-only">Melodiva Music</span>
        </>
      )}
    </span>
  )
}
