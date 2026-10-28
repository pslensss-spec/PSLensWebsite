import { formatTimeRange } from '../lib/dates'
import type { TimeSlot } from '../lib/types'

interface TimeSlotListProps {
  slots: TimeSlot[]
  selectedId: string | null
  onSelect: (slot: TimeSlot) => void
}

export function TimeSlotList({ slots, selectedId, onSelect }: TimeSlotListProps) {
  if (!slots.length) {
    return <div className="empty">No slots on this day.</div>
  }

  return (
    <div className="slot-list fade-in">
      {slots.map((slot) => {
        const { label } = formatTimeRange(slot.starts_at, slot.ends_at)
        const full = slot.status === 'full' || slot.booked_count >= slot.capacity
        const selected = selectedId === slot.id
        return (
          <button
            key={slot.id}
            type="button"
            className={[
              'slot-row',
              full ? 'slot-row--booked' : '',
              selected ? 'slot-row--selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={full}
            onClick={() => onSelect(slot)}
          >
            <span className={`slot-row__time${full ? ' slot-row__time--struck' : ''}`}>
              {label}
            </span>
            {full ? (
              <span className="pill pill--booked">Booked</span>
            ) : slot.status === 'few_left' ? (
              <span className="pill pill--few">Few left</span>
            ) : (
              <span className="pill pill--open">Open</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
