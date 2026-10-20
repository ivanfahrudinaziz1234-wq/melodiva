import { Text } from '@react-email/components'
import { EmailLayout, brand } from './email-layout'

export function AdminReplyEmail({ body, refCode }: { body: string; refCode: string }) {
  return (
    <EmailLayout preview={body.slice(0, 90)}>
      <Text style={{ fontSize: 15, color: brand.charcoal, lineHeight: '24px', whiteSpace: 'pre-wrap', margin: 0 }}>{body}</Text>
      <Text style={{ fontSize: 12, color: brand.muted, marginTop: 24 }}>Referensi: {refCode}</Text>
    </EmailLayout>
  )
}
