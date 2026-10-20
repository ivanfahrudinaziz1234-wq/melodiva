'use client'

import { Search } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import type { Song } from '@/types/content'
import { FilterChips } from '@/components/shared/filter-chips'
import { WhatsAppButton } from '@/components/shared/whatsapp-button'
import { waLink } from '@/lib/whatsapp'

export function SongBrowser({ songs }: { songs: Song[] }) {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('semua')
  const deferred = useDeferredValue(query)
  const genres = useMemo(() => [...new Set(songs.map((s) => s.genre))].sort(), [songs])

  const shown = useMemo(() => {
    const q = deferred.trim().toLowerCase()
    return songs.filter(
      (s) => (genre === 'semua' || s.genre === genre) && (!q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)),
    )
  }, [songs, genre, deferred])

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        <label htmlFor="song-search" className="sr-only">
          Cari judul lagu atau penyanyi
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id="song-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari judul lagu atau penyanyi…"
          className="min-h-14 w-full rounded-full border border-input bg-card pr-5 pl-12 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <FilterChips
        id="genre"
        label="Filter genre"
        value={genre}
        onChange={setGenre}
        options={[{ value: 'semua', label: 'Semua genre' }, ...genres.map((g) => ({ value: g, label: g }))]}
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {shown.length} lagu ditemukan
      </p>
      {shown.length > 0 ? (
        <ul className="grid gap-x-8 sm:grid-cols-2">
          {shown.map((s) => (
            <li key={`${s.title}-${s.artist}`} className="flex items-center justify-between gap-4 border-b border-border py-4">
              <span>
                <span className="block font-medium">{s.title}</span>
                <span className="text-sm text-muted-foreground">{s.artist}</span>
              </span>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-text">{s.genre}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-lg font-medium">Lagu yang Anda cari belum ada di daftar.</p>
          <p className="text-muted-foreground">Tenang, kami bisa mempelajari lagu request. Kabari kami minimal 2 minggu sebelum acara.</p>
          <WhatsAppButton href={waLink(`Halo Melodiva, apakah bisa membawakan lagu "${query.trim()}"?`)} label="Request lagu via WhatsApp" />
        </div>
      )}
    </div>
  )
}
