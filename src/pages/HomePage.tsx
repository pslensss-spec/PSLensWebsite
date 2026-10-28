import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCard } from '../components/CalendarCard'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { TimeSlotList } from '../components/TimeSlotList'
import { formatDayLabel, toDateKey } from '../lib/dates'
import { demoSlots, demoStudio } from '../lib/demoSlots'
import { googleFormConfigured, googleFormUrl } from '../lib/googleForm'
import type { SlotStatus, TimeSlot } from '../lib/types'

export function HomePage() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => new Date(2026, 9, 1))
  const [selectedDay, setSelectedDay] = useState(() => new Date(2026, 9, 28))
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const slotsByDay = useMemo(() => {
    const map: Record<string, { status: SlotStatus }[]> = {}
    for (const slot of demoSlots) {
      const key = toDateKey(new Date(slot.starts_at))
      if (!map[key]) map[key] = []
      map[key].push({ status: slot.status })
    }
    return map
  }, [])

  const daySlots = useMemo(() => {
    const key = toDateKey(selectedDay)
    return demoSlots.filter((s) => toDateKey(new Date(s.starts_at)) === key)
  }, [selectedDay])

  const openCount = daySlots.filter(
    (s) => s.status !== 'full' && s.booked_count < s.capacity,
  ).length

  function handleContinue() {
    if (!selectedSlotId) return
    // Customer info is collected via Google Form (Contact)
    if (googleFormConfigured && googleFormUrl) {
      navigate('/contact')
      return
    }
    navigate('/contact')
  }

  function onSelectSlot(slot: TimeSlot) {
    setSelectedSlotId(slot.id)
  }

  return (
    <div>
      <div className="header-row fade-in">
        <div>
          <p className="eyebrow">
            {demoStudio.code} · {demoStudio.shoot_type}
          </p>
          <h1 className="page-title">Pick your shoot slot.</h1>
        </div>
        <ProfileAvatar />
      </div>

      <CalendarCard
        month={month}
        selected={selectedDay}
        slotsByDay={slotsByDay}
        onMonthChange={(next) => {
          setMonth(next)
          setSelectedSlotId(null)
        }}
        onSelectDay={(day) => {
          setSelectedDay(day)
          setSelectedSlotId(null)
        }}
      />

      <div className="slot-meta">
        <h3>{formatDayLabel(selectedDay)}</h3>
        <span className="small muted">
          {openCount} of {daySlots.length} open
        </span>
      </div>

      <TimeSlotList slots={daySlots} selectedId={selectedSlotId} onSelect={onSelectSlot} />

      <button
        type="button"
        className="btn btn--primary"
        disabled={!selectedSlotId}
        onClick={handleContinue}
      >
        {selectedSlotId ? 'Continue to your details →' : 'Select a time slot →'}
      </button>

      <p className="small muted" style={{ marginTop: 12, textAlign: 'center' }}>
        Next step: tell us who you are — we collect details with Google Forms.
      </p>
    </div>
  )
}
