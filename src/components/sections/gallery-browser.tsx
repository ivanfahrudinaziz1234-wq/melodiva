'use client'

import { useState } from 'react'
import type { GalleryItem } from '@/types/content'
import { FilterChips } from '@/components/shared/filter-chips'
import { GalleryGrid } from '@/components/shared/gallery-grid'

export function GalleryBrowser({ items, labels }: { items: GalleryItem[]; labels: Record<string, string> }) {
  const [filter, setFilter] = useState('semua')
  const categories = [...new Set(items.map((g) => g.category))]
  const shown = filter === 'semua' ? items : items.filter((g) => g.category === filter)

  return (
    <div className="flex flex-col gap-10">
      <FilterChips
        id="gallery"
        label="Filter kategori foto"
        value={filter}
        onChange={setFilter}
        options={[{ value: 'semua', label: 'Semua' }, ...categories.map((c) => ({ value: c, label: labels[c] ?? c }))]}
      />
      <GalleryGrid key={filter} items={shown} />
    </div>
  )
}
