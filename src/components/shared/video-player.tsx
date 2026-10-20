'use client'

import Image from 'next/image'
import { Play } from 'lucide-react'
import { useState } from 'react'
import type { Video } from '@/types/content'
import { cn } from '@/lib/utils'

/**
 * Lite embed: shows the thumbnail and only loads the privacy-enhanced
 * youtube-nocookie iframe (or local mp4) after the visitor clicks play.
 */
export function VideoPlayer({ video, className, priority = false }: { video: Video; className?: string; priority?: boolean }) {
  const [active, setActive] = useState(false)

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-2xl bg-black', className)}>
      {active ? (
        video.type === 'youtube' ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <video src={video.src} poster={video.thumbnail} controls autoPlay playsInline className="absolute inset-0 size-full">
            <track kind="captions" />
          </video>
        )
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 size-full">
          <Image
            src={video.thumbnail}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 60rem, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground shadow-xl transition-transform group-hover:scale-105 group-active:scale-95">
              <Play className="size-5 fill-current" aria-hidden="true" />
              Putar video
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-0 p-4 text-left text-white md:p-6">
            <span className="line-clamp-2 font-serif text-lg font-semibold md:text-2xl">{video.title}</span>
          </span>
          <span className="sr-only">: {video.title}</span>
        </button>
      )}
    </div>
  )
}
