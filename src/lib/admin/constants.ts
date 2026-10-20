export const messageStatuses = ['new', 'read', 'replied', 'done', 'spam', 'archived'] as const
export type MessageStatus = (typeof messageStatuses)[number]

export const messageStatusLabels: Record<MessageStatus, string> = {
  new: 'Baru',
  read: 'Dibaca',
  replied: 'Dibalas',
  done: 'Selesai',
  spam: 'Spam',
  archived: 'Arsip',
}

export const bookingStatuses = ['negotiating', 'tentative', 'deal', 'done', 'cancelled'] as const
export type BookingStatus = (typeof bookingStatuses)[number]

export const bookingStatusLabels: Record<BookingStatus, string> = {
  negotiating: 'Negosiasi',
  tentative: 'Tentatif',
  deal: 'Deal',
  done: 'Selesai',
  cancelled: 'Batal',
}

export type ActionState = { ok?: boolean; error?: string; message?: string; mfaRequired?: boolean; conflicts?: string[] }

export type Message = {
  id: string
  ref_code: string
  name: string
  whatsapp: string
  email: string
  event_type: string
  event_date: string | null
  location: string | null
  guests: number | null
  message: string
  status: MessageStatus
  is_read: boolean
  internal_note: string | null
  email_status: string | null
  created_at: string
}

export type Booking = {
  id: string
  message_id: string | null
  client_name: string
  whatsapp: string
  event_type: string
  package_slug: string | null
  event_date: string
  start_time: string | null
  venue: string | null
  lineup: string | null
  status: BookingStatus
  agreed_price: number | null
  payment_notes: string | null
  notes: string | null
  created_at: string
}

export type ReplyTemplate = { id: string; title: string; subject: string; body: string }
