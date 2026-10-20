const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' })
const shortFormatter = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short' })

/** YYYY-MM-DD in Asia/Jakarta. */
export function jakartaDay(date: Date | string = new Date()) {
  return dayFormatter.format(typeof date === 'string' ? new Date(date) : date)
}

export function lastNDays(n: number) {
  const days: { key: string; label: string }[] = []
  const now = Date.now()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000)
    days.push({ key: jakartaDay(d), label: shortFormatter.format(d) })
  }
  return days
}

export function daysAgoIso(n: number) {
  return new Date(Date.now() - n * 86_400_000).toISOString()
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}
