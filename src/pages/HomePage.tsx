import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCard } from '../components/CalendarCard'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { TimeSlotList } from '../components/TimeSlotList'
import { WhatsAppButton } from '../components/WhatsAppButton'
import { formatDayLabel, formatTimeRange, toDateKey } from '../lib/dates'
import { demoSlots, demoStudio } from '../lib/demoSlots'
import { googleFormConfigured, googleFormUrl } from '../lib/googleForm'
import { whatsappConfigured } from '../lib/whatsapp'
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

  const selectedSlot = daySlots.find((s) => s.id === selectedSlotId)
  const waMessage = selectedSlot
    ? `Hi PSLens — I'd like to book ${demoStudio.code} on ${formatDayLabel(selectedDay)} · ${formatTimeRange(selectedSlot.starts_at, selectedSlot.ends_at).label}.`
    : `Hi PSLens — I'd like to book a ${demoStudio.code} reel shoot.`

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

      <div style={{ marginTop: 12 }}>
        {whatsappConfigured ? (
          <WhatsAppButton message={waMessage} label="Book via WhatsApp" />
        ) : (
          <p className="small muted" style={{ textAlign: 'center', margin: 0 }}>
            WhatsApp button needs <code>VITE_WHATSAPP_NUMBER</code> in Netlify / .env
          </p>
        )}
      </div>

      <p className="small muted" style={{ marginTop: 12, textAlign: 'center' }}>
        Or continue to the form — we collect details with Google Forms.
      </p>
    </div>
  )
}
