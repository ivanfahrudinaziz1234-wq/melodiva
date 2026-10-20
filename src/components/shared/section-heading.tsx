import { FadeIn } from '@/components/motion/fade-in'
import { cn } from '@/lib/utils'

/** Thin gold divider with a small piano-key ornament in the middle. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 text-gold', className)} aria-hidden="true">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/70" />
      <span className="flex items-end gap-[3px]">
        {[10, 7, 12, 7, 10].map((h, i) => (
          <span key={i} className={cn('w-[5px] rounded-[1px]', i % 2 ? 'bg-primary' : 'bg-gold')} style={{ height: h }} />
        ))}
      </span>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/70" />
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
  className?: string
}) {
  return (
    <FadeIn className={cn('flex flex-col gap-4', align === 'center' && 'items-center text-center', className)}>
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-text">{eyebrow}</span>
      )}
      <Heading className="text-3xl font-semibold md:text-5xl">{title}</Heading>
      <Ornament className={align === 'center' ? 'justify-center' : ''} />
      {description && <p className="prose-width text-pretty text-muted-foreground">{description}</p>}
    </FadeIn>
  )
}
