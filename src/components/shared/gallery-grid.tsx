'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Lightbox } from '@/components/shared/lightbox'

/** Masonry grid where every photo opens the shared lightbox. */
export function GalleryGrid({ items }: { items: { id: string; src: string; alt: string; width: number; height: number }[] }) {
  const [index, setIndex] = useState<number | null>(null)

  return (
    <>
      <ul className="columns-2 gap-4 md:columns-3 [&>li]:mb-4">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
            className="break-inside-avoid"
          >
            <button type="button" onClick={() => setIndex(i)} className="group relative block w-full overflow-hidden rounded-xl bg-muted">
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 768px) 33vw, 50vw"
                className="h-auto w-full transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" aria-hidden="true" />
              <span className="sr-only">Perbesar foto</span>
            </button>
          </motion.li>
        ))}
      </ul>
      <Lightbox images={items} index={index} onChange={setIndex} />
    </>
  )
}
