import { supabase } from './supabase'

async function authHeader() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Please sign in to continue')
  return { Authorization: `Bearer ${token}` }
}

export async function createBooking(slotId: string) {
  const headers = await authHeader()
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ slotId }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Could not create booking')
  return body
}

export async function cancelBooking(bookingId: string) {
  const headers = await authHeader()
  const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Could not cancel booking')
  return body
}

export async function sendContact(payload: {
  name: string
  email: string
  message: string
}) {
  let headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    headers = { ...headers, ...(await authHeader()) }
  } catch {
    // Contact allowed without auth
  }
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Could not send message')
  return body
}
