import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCard } from '../components/CalendarCard'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { TimeSlotList } from '../components/TimeSlotList'
import { useAuth } from '../hooks/useAuth'
import { createBooking } from '../lib/api'
import { formatDayLabel, toDateKey } from '../lib/dates'
import { supabase } from '../lib/supabase'
import type { SlotStatus, Studio, TimeSlot } from '../lib/types'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [studio, setStudio] = useState<Studio | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [month, setMonth] = useState(() => new Date(2026, 9, 1))
  const [selectedDay, setSelectedDay] = useState(() => new Date(2026, 9, 28))
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data: studios } = await supabase
        .from('studios')
        .select('id, code, name, shoot_type')
        .eq('code', 'STUDIO 04')
        .limit(1)

      const studioRow = studios?.[0] ?? null
      if (!studioRow) {
        if (!cancelled) {
          setStudio(null)
          setSlots([])
          setLoading(false)
        }
        return
      }

      const start = new Date(month.getFullYear(), month.getMonth(), 1)
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 1)

      const { data: slotRows } = await supabase
        .from('time_slots')
        .select('id, studio_id, starts_at, ends_at, capacity, booked_count, status')
        .eq('studio_id', studioRow.id)
        .gte('starts_at', start.toISOString())
        .lt('starts_at', end.toISOString())
        .order('starts_at', { ascending: true })

      if (!cancelled) {
        setStudio(studioRow)
        setSlots((slotRows as TimeSlot[]) ?? [])
        setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [month])

  const slotsByDay = useMemo(() => {
    const map: Record<string, { status: SlotStatus }[]> = {}
    for (const slot of slots) {
      const key = toDateKey(new Date(slot.starts_at))
      if (!map[key]) map[key] = []
      map[key].push({ status: slot.status })
    }
    return map
  }, [slots])

  const daySlots = useMemo(() => {
    const key = toDateKey(selectedDay)
    return slots.filter((s) => toDateKey(new Date(s.starts_at)) === key)
  }, [slots, selectedDay])

  const openCount = daySlots.filter(
    (s) => s.status !== 'full' && s.booked_count < s.capacity,
  ).length

  async function handleBook() {
    setMessage(null)
    if (!selectedSlotId) return
    if (!user) {
      navigate('/auth', { state: { from: '/', slotId: selectedSlotId } })
      return
    }
    setBusy(true)
    try {
      await createBooking(selectedSlotId)
      setMessage({ type: 'ok', text: 'Booking confirmed. Check Bookings for details.' })
      setSelectedSlotId(null)
      // refresh slots
      const start = new Date(month.getFullYear(), month.getMonth(), 1)
      const end = new Date(month.getFullYear(), month.getMonth() + 1, 1)
      const { data: slotRows } = await supabase
        .from('time_slots')
        .select('id, studio_id, starts_at, ends_at, capacity, booked_count, status')
        .eq('studio_id', studio!.id)
        .gte('starts_at', start.toISOString())
        .lt('starts_at', end.toISOString())
        .order('starts_at', { ascending: true })
      setSlots((slotRows as TimeSlot[]) ?? [])
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Booking failed',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="header-row fade-in">
        <div>
          <p className="eyebrow">
            {studio ? `${studio.code} · ${studio.shoot_type}` : 'PSLens Studio'}
          </p>
          <h1 className="page-title">Pick your shoot slot.</h1>
        </div>
        <ProfileAvatar />
      </div>

      {loading ? (
        <div className="empty">Loading calendar…</div>
      ) : (
        <>
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

          <TimeSlotList
            slots={daySlots}
            selectedId={selectedSlotId}
            onSelect={(slot) => setSelectedSlotId(slot.id)}
          />

          <button
            type="button"
            className="btn btn--primary"
            disabled={!selectedSlotId || busy}
            onClick={() => void handleBook()}
          >
            {busy ? 'Booking…' : selectedSlotId ? 'Confirm booking →' : 'Select a time slot →'}
          </button>

          {message ? (
            <div className={`toast toast--${message.type}`}>{message.text}</div>
          ) : null}
        </>
      )}
    </div>
  )
}
