'use client'

import { usePathname } from 'next/navigation'
import { SocialIcon } from '@/components/shared/social-icon'
import { waLink } from '@/lib/whatsapp'

/** Pulsing floating WhatsApp CTA; hidden on /kontak and while the mobile menu is open. */
export function WhatsAppFloat() {
  const pathname = usePathname()
  if (pathname.startsWith('/kontak')) return null

  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 inline-flex min-h-14 items-center gap-2 rounded-full bg-[#1f8f4e] px-5 font-medium text-white shadow-xl shadow-black/20 transition-transform hover:-translate-y-1 active:scale-95 in-data-[menu-open=true]:hidden"
    >
      <span aria-hidden="true" className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#1f8f4e]/40 [animation-duration:2.4s]" />
      <SocialIcon icon="whatsapp" className="size-6" />
      <span className="hidden sm:inline">Chat WhatsApp</span>
      <span className="sm:hidden">Chat</span>
    </a>
  )
}
