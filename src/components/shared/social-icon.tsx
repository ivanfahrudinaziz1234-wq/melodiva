import { Link2 } from 'lucide-react'
import type { SocialIcon as SocialIconName } from '@/types/content'
import { cn } from '@/lib/utils'

/** Brand glyphs (lucide v1 no longer ships brand icons). */
const paths: Partial<Record<SocialIconName, React.ReactNode>> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </>
  ),
  whatsapp: (
    <path
      fill="currentColor"
      d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.2-.2-.2-.4-.3Z"
    />
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path fill="currentColor" d="m10 9 5 3-5 3V9Z" />
    </>
  ),
  tiktok: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.2 4.4 5 4.6"
    />
  ),
  facebook: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M15 3h-2a4 4 0 0 0-4 4v3H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7.5a1 1 0 0 1 1-1H15V3Z"
    />
  ),
  spotify: (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M7 9.5c3.5-1 7-.7 10 1M7.8 12.8c2.8-.7 5.5-.4 7.9.9M8.5 15.8c2-.4 4-.2 5.8.7" />
    </>
  ),
  x: <path fill="currentColor" d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />,
}

export function SocialIcon({ icon, className }: { icon: SocialIconName; className?: string }) {
  const glyph = paths[icon]
  if (!glyph) return <Link2 className={cn('size-5', className)} aria-hidden="true" />
  return (
    <svg viewBox="0 0 24 24" className={cn('size-5', className)} aria-hidden="true">
      {glyph}
    </svg>
  )
}
