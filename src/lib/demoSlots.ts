import type { SlotStatus, TimeSlot } from './types'

/** Static demo inventory for the mobile UI when Google Forms is the backend. */
const STUDIO_ID = 'demo-studio-04'

function iso(day: string, hour: number, minute = 0) {
  // America/New_York wall time approximated as UTC-4 for Oct (EDT)
  const h = String(hour).padStart(2, '0')
  const m = String(minute).padStart(2, '0')
  return `${day}T${h}:${m}:00.000-04:00`
}

const blocks = [
  [9, 0, 10, 30],
  [11, 0, 12, 30],
  [13, 0, 14, 30],
  [15, 0, 16, 30],
  [17, 0, 18, 30],
  [19, 0, 20, 30],
  [21, 0, 22, 30],
] as const

const days = ['2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31']

export const demoStudio = {
  id: STUDIO_ID,
  code: 'STUDIO 04',
  name: 'Studio 04',
  shoot_type: 'REEL SHOOTS',
}

export const demoSlots: TimeSlot[] = days.flatMap((day, di) =>
  blocks.map(([sh, sm, eh, em], bi) => {
    const booked = day === '2026-10-28' && bi === 0
    const status: SlotStatus = booked ? 'full' : 'open'
    return {
      id: `demo-${di}-${bi}`,
      studio_id: STUDIO_ID,
      starts_at: iso(day, sh, sm),
      ends_at: iso(day, eh, em),
      capacity: 1,
      booked_count: booked ? 1 : 0,
      status,
    }
  }),
)
