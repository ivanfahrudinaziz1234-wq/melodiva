import { CountUp } from '@/components/motion/count-up'
import { StaggerChildren, StaggerItem } from '@/components/motion/fade-in'
import { stats } from '@/lib/content'

export function Stats() {
  return (
    <section aria-label="Melodiva dalam angka" className="relative overflow-hidden bg-primary text-primary-foreground">
      <div aria-hidden="true" className="grain absolute inset-0 opacity-10 mix-blend-overlay" />
      <StaggerChildren as="ul" className="container-page relative grid grid-cols-2 divide-white/15 py-14 md:grid-cols-4 md:divide-x">
        {stats.map((s) => (
          <StaggerItem as="li" key={s.id} className="flex flex-col items-center gap-1 px-4 py-4 text-center">
            <span className="font-serif text-4xl font-semibold md:text-6xl">
              <CountUp value={s.value} suffix={s.suffix} />
            </span>
            <span className="text-sm text-primary-foreground/80 md:text-base">{s.label}</span>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  )
}
