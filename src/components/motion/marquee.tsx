import { cn } from '@/lib/utils'

/** CSS-only infinite marquee; pauses on hover and stops under reduced motion (via global CSS). */
export function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
}: {
  children: React.ReactNode
  className?: string
  duration?: number
  reverse?: boolean
}) {
  return (
    <div
      className={cn(
        'group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        className,
      )}
    >
      <div
        className="flex w-max animate-marquee gap-10 pr-10 group-hover:[animation-play-state:paused]"
        style={{ '--marquee-duration': `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' } as React.CSSProperties}
      >
        {children}
        <div aria-hidden="true" className="flex gap-10">
          {children}
        </div>
      </div>
    </div>
  )
}
