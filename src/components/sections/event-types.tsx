import { Briefcase, Cake, Clock, Coffee, Heart, Music, PartyPopper, Sparkles, type LucideIcon } from 'lucide-react'
import { StaggerChildren, StaggerItem } from '@/components/motion/fade-in'
import { TiltCard } from '@/components/motion/tilt-card'
import { SectionHeading } from '@/components/shared/section-heading'
import { eventTypeCards } from '@/lib/content'
import { cn } from '@/lib/utils'

export const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  briefcase: Briefcase,
  cake: Cake,
  party: PartyPopper,
  coffee: Coffee,
  music: Music,
  clock: Clock,
  sparkles: Sparkles,
}

export function EventTypes() {
  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        align="center"
        eyebrow="Untuk Setiap Acara"
        title="Dari akad yang khidmat sampai pesta yang meriah"
        description="Kami menyesuaikan repertoar, volume, dan formasi dengan suasana acara Anda."
      />
      <StaggerChildren className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {eventTypeCards.map((card, i) => {
          const Icon = iconMap[card.icon] ?? Music
          return (
            <StaggerItem key={card.id} className={cn(i === 0 && 'lg:row-span-2')}>
              <TiltCard
                className={cn(
                  'flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-7',
                  i === 0 && 'justify-end bg-gradient-to-br from-primary to-[#5e1f27] text-primary-foreground',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-12 items-center justify-center rounded-xl',
                    i === 0 ? 'bg-white/15 text-[#d9b84a]' : 'bg-primary/10 text-primary-text',
                  )}
                >
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className={cn('font-serif font-semibold', i === 0 ? 'text-3xl' : 'text-xl')}>{card.title}</h3>
                <p className={i === 0 ? 'text-primary-foreground/85' : 'text-muted-foreground'}>{card.description}</p>
              </TiltCard>
            </StaggerItem>
          )
        })}
      </StaggerChildren>
    </section>
  )
}
