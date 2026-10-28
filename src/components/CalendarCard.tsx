import {
  addMonths,
  buildCalendarCells,
  dayAvailability,
  formatMonthYear,
  getWeekdayLabels,
  sameDay,
  toDateKey,
} from '../lib/dates'
import type { SlotStatus } from '../lib/types'

interface CalendarCardProps {
  month: Date
  selected: Date
  slotsByDay: Record<string, { status: SlotStatus }[]>
  onMonthChange: (next: Date) => void
  onSelectDay: (day: Date) => void
}

export function CalendarCard({
  month,
  selected,
  slotsByDay,
  onMonthChange,
  onSelectDay,
}: CalendarCardProps) {
  const cells = buildCalendarCells(month)

  return (
    <section className="card fade-in">
      <div className="calendar-head">
        <button
          type="button"
          className="icon-btn"
          aria-label="Previous month"
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          ‹
        </button>
        <h2>{formatMonthYear(month)}</h2>
        <button
          type="button"
          className="icon-btn"
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          ›
        </button>
      </div>

      <div className="weekday-row">
        {getWeekdayLabels().map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="day-grid">
        {cells.map((day, idx) => {
          if (!day) return <span key={`empty-${idx}`} />
          const avail = dayAvailability(day, slotsByDay)
          const available = avail !== 'none'
          const selectedDay = sameDay(day, selected)
          return (
            <button
              key={toDateKey(day)}
              type="button"
              className={[
                'day-cell',
                available ? 'day-cell--available' : '',
                selectedDay ? 'day-cell--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={!available}
              onClick={() => onSelectDay(day)}
            >
              {day.getDate()}
              {selectedDay ? <span className="day-cell__dot" /> : null}
            </button>
          )
        })}
      </div>

      <div className="legend">
        <span>
          <i className="dot dot--open" /> Open
        </span>
        <span>
          <i className="dot dot--few" /> Few left
        </span>
        <span>
          <i className="dot dot--full" /> Full / closed
        </span>
      </div>
    </section>
  )
}
