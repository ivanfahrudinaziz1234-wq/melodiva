import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/motion/fade-in'

/** Gentle "what's next" card at the end of a page. */
export function NextCue({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <section className="container-page py-16 md:py-20">
      <FadeIn>
        <Link
          href={href}
          className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl md:flex-row md:items-center md:justify-between md:p-10"
        >
          <span className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-text">Lanjut</span>
            <span className="font-serif text-2xl font-semibold md:text-3xl">{label}</span>
            <span className="text-muted-foreground">{description}</span>
          </span>
          <span className="inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-primary px-6 font-medium text-primary-foreground transition-colors group-hover:bg-primary-hover md:self-auto">
            Buka halaman
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      </FadeIn>
    </section>
  )
}
