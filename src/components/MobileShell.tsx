import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BottomNav } from './BottomNav'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function MobileShell() {
  const { user } = useAuth()
  const [bookingCount, setBookingCount] = useState(0)
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }),
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        }),
      )
    }, 30_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!user) {
      setBookingCount(0)
      return
    }

    let cancelled = false

    async function load() {
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'confirmed')
      if (!cancelled) setBookingCount(count ?? 0)
    }

    void load()

    const channel = supabase
      .channel('bookings-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` },
        () => {
          void load()
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <div className="page-stage">
      <div className="phone">
        <div className="status-bar">
          <span>{time}</span>
          <div className="status-bar__island" aria-hidden />
          <div className="status-bar__icons" aria-hidden>
            <svg width="16" height="12" viewBox="0 0 16 12">
              <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
              <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="currentColor" />
              <rect x="9" y="2" width="3" height="10" rx="0.5" fill="currentColor" />
              <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="currentColor" />
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12">
              <path
                d="M8 3.5c2.2 0 4.2.9 5.7 2.3l-1.1 1.1A6.4 6.4 0 0 0 8 5.2a6.4 6.4 0 0 0-4.6 1.7L2.3 5.8A8 8 0 0 1 8 3.5Zm0 3.2c1.3 0 2.5.5 3.4 1.4L10.3 9.2A3.2 3.2 0 0 0 8 8.2c-.9 0-1.7.3-2.3 1L4.6 8.1A4.8 4.8 0 0 1 8 6.7Zm0 3.1c.5 0 .9.2 1.2.5L8 11.5l-1.2-1.2c.3-.3.7-.5 1.2-.5Z"
                fill="currentColor"
              />
            </svg>
            <svg width="24" height="12" viewBox="0 0 24 12">
              <rect x="0" y="1" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <rect x="2" y="3" width="14" height="6" rx="1" fill="currentColor" />
              <rect x="21" y="4" width="2" height="4" rx="0.5" fill="currentColor" />
            </svg>
          </div>
        </div>
        <div className="app-scroll">
          <Outlet />
        </div>
        <BottomNav bookingCount={bookingCount} />
      </div>
    </div>
  )
}
