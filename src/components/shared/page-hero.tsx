import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { TextReveal } from '@/components/motion/text-reveal'
import { FadeIn } from '@/components/motion/fade-in'
import { Ornament } from '@/components/shared/section-heading'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbLd } from '@/lib/seo'

/** Shared inner-page hero: visible breadcrumb + BreadcrumbList JSON-LD + the page H1. */
export function PageHero({
  title,
  description,
  eyebrow,
  breadcrumbs,
}: {
  title: string
  description: string
  eyebrow?: string
  breadcrumbs: { name: string; path: string }[]
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 via-background to-background pt-32 pb-16 md:pt-40 md:pb-20">
      <JsonLd data={breadcrumbLd(breadcrumbs)} />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />
      <div className="container-page relative flex flex-col gap-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="link-underline hover:text-foreground">
                Beranda
              </Link>
            </li>
            {breadcrumbs.map((b, i) => (
              <li key={b.path} className="flex items-center gap-1">
                <ChevronRight className="size-3.5" aria-hidden="true" />
                {i === breadcrumbs.length - 1 ? (
                  <span aria-current="page" className="text-foreground">
                    {b.name}
                  </span>
                ) : (
                  <Link href={b.path} className="link-underline hover:text-foreground">
                    {b.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <span className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-text">{eyebrow}</span>}
        <TextReveal as="h1" text={title} animateOnMount className="text-4xl font-semibold md:text-6xl" />
        <Ornament />
        <FadeIn delay={0.3}>
          <p className="prose-width text-pretty text-lg text-muted-foreground">{description}</p>
        </FadeIn>
      </div>
    </section>
  )
}
