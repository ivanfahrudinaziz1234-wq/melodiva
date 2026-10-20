import { z } from 'zod'
import { normalizeIndonesianPhone } from '@/lib/whatsapp'

export const contactEventTypes = ['wedding', 'event', 'birthday', 'party', 'reguler', 'lainnya'] as const

export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 1000

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Mohon isi nama Anda (minimal 2 huruf).').max(80, 'Nama terlalu panjang (maks. 80 karakter).'),
  whatsapp: z
    .string()
    .trim()
    .min(1, 'Mohon isi nomor WhatsApp.')
    .refine((v) => /^628\d{7,11}$/.test(normalizeIndonesianPhone(v)), 'Format nomor belum sesuai. Contoh: 0812 3456 7890.'),
  email: z.string().trim().min(1, 'Mohon isi alamat email.').max(120).pipe(z.email('Alamat email belum valid.')),
  eventType: z.enum(contactEventTypes, { error: 'Pilih jenis acara.' }),
  eventDate: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Tanggal belum valid.')
    .optional(),
  location: z.string().trim().max(120, 'Lokasi terlalu panjang (maks. 120 karakter).').optional(),
  guests: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d{1,5}$/.test(v) && Number(v) > 0 && Number(v) <= 20000), 'Jumlah tamu antara 1 dan 20.000.')
    .optional(),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `Ceritakan sedikit tentang acara Anda (minimal ${MESSAGE_MIN} karakter).`)
    .max(MESSAGE_MAX, `Pesan maksimal ${MESSAGE_MAX} karakter.`),
  consent: z.boolean().refine((v) => v, 'Mohon centang persetujuan agar kami bisa menghubungi Anda.'),
  website: z.string().max(0).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

export const contactRequestSchema = contactSchema.extend({
  idempotencyKey: z.string().regex(/^[a-zA-Z0-9-]{16,64}$/),
  turnstileToken: z.string().max(4096).optional(),
  website: z.string().max(500).optional(),
})
