'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { Member } from '@/types/content'
import { SectionHeading } from '@/components/shared/section-heading'

export function MembersCarousel({ members }: { members: Member[] }) {
  const track = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' })

  return (
    <section className="overflow-hidden bg-card py-20 md:py-28">
      <div className="container-page flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Personel" title="Wajah di balik setiap nada" />
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent">
            <ChevronLeft className="size-4" aria-hidden="true" />
            Sebelumnya
          </button>
          <button type="button" onClick={() => scroll(1)} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent">
            Berikutnya
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul
        ref={track}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))] pb-4 [scrollbar-width:none]"
      >
        {members.map((m) => (
          <li key={m.slug} className="w-[75vw] max-w-xs shrink-0 snap-start sm:w-72">
            <Link href={`/personel/${m.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                <Image src={m.photo} alt={`Foto ${m.name}`} fill sizes="20rem" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="block font-serif text-2xl font-semibold">{m.nickname ?? m.name}</span>
                  <span className="text-sm text-[#d9b84a]">{m.role}</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
