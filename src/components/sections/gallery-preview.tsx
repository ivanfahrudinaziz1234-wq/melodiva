import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GalleryGrid } from '@/components/shared/gallery-grid'
import { SectionHeading } from '@/components/shared/section-heading'
import { gallery } from '@/lib/content'

export function GalleryPreview() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Galeri" title="Cerita dari atas panggung" />
        <Link href="/galeri" className="group inline-flex min-h-11 items-center gap-2 font-medium text-primary-text">
          <span className="link-underline">Buka galeri lengkap</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
      <GalleryGrid items={gallery.slice(0, 6)} />
    </section>
  )
}
