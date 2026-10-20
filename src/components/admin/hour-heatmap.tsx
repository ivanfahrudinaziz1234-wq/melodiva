const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const JAKARTA_OFFSET_MS = 7 * 3_600_000

/** Builds a 7x24 grid (weekday x hour, Asia/Jakarta — fixed UTC+7, no DST). */
export function buildHourGrid(timestamps: string[]) {
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0))
  for (const ts of timestamps) {
    const d = new Date(new Date(ts).getTime() + JAKARTA_OFFSET_MS)
    grid[d.getUTCDay()][d.getUTCHours()]++
  }
  return grid
}

export function HourHeatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(1, ...grid.flat())
  let peak = { day: 0, hour: 0, value: 0 }
  grid.forEach((row, day) => row.forEach((value, hour) => value > peak.value && (peak = { day, hour, value })))

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0.5 text-xs">
          <caption className="sr-only">Jumlah kunjungan per hari dan jam (WIB)</caption>
          <thead>
            <tr>
              <th scope="col" className="w-10" />
              {Array.from({ length: 24 }, (_, h) => (
                <th key={h} scope="col" className="font-normal text-muted-foreground">
                  {h % 3 === 0 ? String(h).padStart(2, '0') : <span className="sr-only">{h}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, day) => (
              <tr key={day}>
                <th scope="row" className="pr-1 text-left font-normal text-muted-foreground">
                  {dayLabels[day]}
                </th>
                {row.map((value, hour) => (
                  <td
                    key={hour}
                    title={`${dayLabels[day]} ${String(hour).padStart(2, '0')}:00 — ${value} kunjungan`}
                    className="h-5 rounded-sm bg-primary"
                    style={{ opacity: value === 0 ? 0.06 : 0.15 + (value / max) * 0.85 }}
                  >
                    <span className="sr-only">{value}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {peak.value > 0 && (
        <p className="text-sm text-muted-foreground">
          Jam tersibuk: <span className="font-medium text-foreground">{dayLabels[peak.day]}, {String(peak.hour).padStart(2, '0')}:00 WIB</span> ({peak.value} kunjungan)
        </p>
      )}
    </div>
  )
}
