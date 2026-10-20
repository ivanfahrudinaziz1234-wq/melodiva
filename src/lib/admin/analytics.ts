export const sourceLabels: Record<string, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  google: 'Google',
  direct: 'Langsung',
  other: 'Lainnya',
}

export function tally<T>(rows: T[], pick: (row: T) => string | null | undefined, limit = 8) {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const k = pick(r) || 'Tidak diketahui'
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }))
}
