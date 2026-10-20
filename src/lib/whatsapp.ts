import { site } from '@/lib/content'

/** Builds a wa.me link with a URL-encoded prefilled message. */
export function waLink(message: string = site.whatsappDefaultMessage, number: string = site.whatsappNumber) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

export function waPackageLink(packageName: string) {
  return waLink(`${site.whatsappDefaultMessage} Saya tertarik dengan ${packageName}.`)
}

export function waReferenceLink(refCode: string) {
  return waLink(`${site.whatsappDefaultMessage} Nomor referensi pesan saya: ${refCode}.`)
}

/** Converts Indonesian numbers (08xx, +62, 62) into the 62xxxx form wa.me expects. */
export function normalizeIndonesianPhone(input: string) {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('8')) return `62${digits}`
  return digits
}

export function waClientLink(phone: string, message = '') {
  return waLink(message, normalizeIndonesianPhone(phone))
}
