import { Plus } from 'lucide-react'
import type { Faq } from '@/types/content'

/** Native <details> accordion: works without JS and is fully keyboard accessible. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((f) => (
        <details key={f.id} className="group px-5 md:px-7">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
            <span className="text-lg">{f.question}</span>
            <Plus className="size-5 shrink-0 text-primary-text transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
          </summary>
          <p className="prose-width pb-6 text-pretty text-muted-foreground">{f.answer}</p>
        </details>
      ))}
    </div>
  )
}
