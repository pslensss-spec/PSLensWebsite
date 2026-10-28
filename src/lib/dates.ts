const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

export function getWeekdayLabels() {
  return WEEKDAYS
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatMonthYear(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function formatDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatTimeRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const opts: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  const startStr = start.toLocaleTimeString('en-GB', opts)
  const endStr = end.toLocaleTimeString('en-GB', opts)
  const mins = Math.round((end.getTime() - start.getTime()) / 60000)
  return { startStr, endStr, mins, label: `${startStr} → ${endStr} · ${mins} min` }
}

export function buildCalendarCells(month: Date) {
  const first = startOfMonth(month)
  const startPad = first.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: Array<Date | null> = []

  for (let i = 0; i < startPad; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function dayAvailability(
  date: Date,
  slotsByDay: Record<string, { status: string }[]>,
): 'none' | 'open' | 'few_left' | 'full' {
  const key = toDateKey(date)
  const slots = slotsByDay[key]
  if (!slots?.length) return 'none'
  if (slots.some((s) => s.status === 'open')) return 'open'
  if (slots.some((s) => s.status === 'few_left')) return 'few_left'
  return 'full'
}
