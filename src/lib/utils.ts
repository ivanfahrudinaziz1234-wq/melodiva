import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://melodiva.example').replace(/\/$/, '')

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(value)
    .replace(/\u00a0/g, ' ')
}

export function formatPrice(service: { priceMode: 'fixed' | 'starting' | 'contact'; price?: number }) {
  if (service.priceMode === 'contact' || service.price === undefined) return 'Hubungi untuk penawaran'
  const formatted = formatRupiah(service.price)
  return service.priceMode === 'starting' ? `Mulai dari ${formatted}` : formatted
}

export function formatDateId(date: string | Date, options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }) {
  const d = typeof date === 'string' ? new Date(date.length === 10 ? `${date}T00:00:00` : date) : date
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', ...options }).format(d)
}
