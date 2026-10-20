'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Testimonial } from '@/types/content'
import { Ornament } from '@/components/shared/section-heading'

export function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const go = (d: number) => setIndex((i) => (i + d + items.length) % items.length)

  useEffect(() => {
    if (paused || reduce || items.length < 2) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 6500)
    return () => window.clearInterval(t)
  }, [paused, reduce, items.length])

  const item = items[index]
  if (!item) return null

  return (
    <section aria-roledescription="carousel" aria-label="Testimoni klien" className="container-page py-20 md:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <Quote className="size-12 text-gold" aria-hidden="true" />
        <div className="relative min-h-56 w-full md:min-h-48" aria-live={paused ? 'polite' : 'off'}>
          <AnimatePresence mode="wait">
            <motion.figure
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6"
            >
              <blockquote className="text-balance font-serif text-2xl leading-snug md:text-3xl">“{item.quote}”</blockquote>
              <figcaption>
                <span className="block font-semibold">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.event}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <Ornament />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => go(-1)} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Sebelumnya
          </button>
          <button type="button" onClick={() => setPaused((p) => !p)} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent">
            {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
            {paused ? 'Putar' : 'Jeda'}
          </button>
          <button type="button" onClick={() => go(1)} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent">
            Berikutnya
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {index + 1} dari {items.length}
        </p>
      </div>
    </section>
  )
}
