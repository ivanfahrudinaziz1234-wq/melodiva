import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0E0E10' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          {[40, 28, 20, 28, 40].map((h, i) => (
            <div key={i} style={{ width: 20, height: h * 2.4, borderRadius: 4, background: i % 2 ? '#8C2F39' : '#F5F1EA' }} />
          ))}
        </div>
      </div>
    ),
    size,
  )
}
