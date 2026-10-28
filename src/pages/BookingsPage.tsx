import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { useAuth } from '../hooks/useAuth'
import { cancelBooking } from '../lib/api'
import { formatDayLabel, formatTimeRange } from '../lib/dates'
import { supabase } from '../lib/supabase'
import type { Booking } from '../lib/types'

export function BookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) {
      setBookings([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select(
        'id, user_id, slot_id, status, studio_name, studio_code, shoot_type, starts_at, ends_at, guest_email, guest_name, city, region, country, created_at',
      )
      .eq('user_id', user.id)
      .order('starts_at', { ascending: true })
    setBookings((data as Booking[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCancel(id: string) {
    setBusyId(id)
    setMessage(null)
    try {
      await cancelBooking(id)
      setMessage('Booking cancelled.')
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Cancel failed')
    } finally {
      setBusyId(null)
    }
  }

  if (authLoading || loading) {
    return <div className="empty">Loading bookings…</div>
  }

  if (!user) {
    return (
      <div>
        <div className="header-row">
          <div>
            <p className="eyebrow">Your schedule</p>
            <h1 className="page-title">Bookings</h1>
          </div>
          <ProfileAvatar />
        </div>
        <div className="empty">
          <p>Sign in to see your shoot bookings.</p>
          <Link to="/auth" className="btn btn--primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="header-row fade-in">
        <div>
          <p className="eyebrow">Your schedule</p>
          <h1 className="page-title">Bookings</h1>
        </div>
        <ProfileAvatar />
      </div>

      {!bookings.length ? (
        <div className="empty">
          <p>No bookings yet.</p>
          <Link to="/" className="btn btn--primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Pick a slot
          </Link>
        </div>
      ) : (
        bookings.map((b) => {
          const { label } = formatTimeRange(b.starts_at, b.ends_at)
          const day = formatDayLabel(new Date(b.starts_at))
          return (
            <article key={b.id} className="booking-card fade-in">
              <h3>
                {b.studio_code} · {b.shoot_type}
              </h3>
              <p>
                {day} · {label}
              </p>
              <p style={{ marginTop: 6 }}>
                Status:{' '}
                <strong style={{ color: b.status === 'confirmed' ? '#14532d' : '#6b6b6b' }}>
                  {b.status}
                </strong>
              </p>
              {b.city || b.country ? (
                <p style={{ marginTop: 4 }}>
                  Booked from {[b.city, b.region, b.country].filter(Boolean).join(', ')}
                </p>
              ) : null}
              {b.status === 'confirmed' ? (
                <div className="booking-card__actions">
                  <button
                    type="button"
                    className="btn btn--danger"
                    disabled={busyId === b.id}
                    onClick={() => void handleCancel(b.id)}
                  >
                    {busyId === b.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                </div>
              ) : null}
            </article>
          )
        })
      )}

      {message ? <div className="toast toast--ok">{message}</div> : null}
    </div>
  )
}
