'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback } from 'react'
import { Modal } from '@/components/shared/modal'

export interface LightboxImage {
  src: string
  alt: string
}

/** Image lightbox with arrow keys, buttons and swipe. `index === null` means closed. */
export function Lightbox({
  images,
  index,
  onChange,
}: {
  images: LightboxImage[]
  index: number | null
  onChange: (index: number | null) => void
}) {
  const count = images.length
  const go = useCallback(
    (delta: number) => {
      if (index === null) return
      onChange((index + delta + count) % count)
    },
    [index, count, onChange],
  )
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    },
    [go],
  )
  const close = useCallback(() => onChange(null), [onChange])
  const image = index !== null ? images[index] : null

  return (
    <Modal open={index !== null} onClose={close} label="Galeri foto" onKeyDown={onKeyDown} className="max-w-5xl overflow-visible">
      {image && (
        <figure className="flex flex-col items-center gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={image.src + index}
                className="absolute inset-0 touch-pan-y"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1)
                  if (info.offset.x > 60) go(-1)
                }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-contain" draggable={false} />
              </motion.div>
            </AnimatePresence>
          </div>
          <figcaption className="flex w-full flex-wrap items-center justify-between gap-3 text-white">
            <span className="text-sm text-white/80">
              {image.alt} · {index! + 1}/{count}
            </span>
            {count > 1 && (
              <span className="flex gap-2">
                <button type="button" onClick={() => go(-1)} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-white/10 px-4 text-sm hover:bg-white/20">
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Sebelumnya
                </button>
                <button type="button" onClick={() => go(1)} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-white/10 px-4 text-sm hover:bg-white/20">
                  Berikutnya
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </span>
            )}
          </figcaption>
        </figure>
      )}
    </Modal>
  )
}
