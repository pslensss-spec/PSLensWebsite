import type { Config, Context } from '@netlify/functions'
import { sendDiscord } from './_shared/discord'
import { sendEmail, studioNotifyEmail } from './_shared/email'
import { lookupGeo } from './_shared/geo'
import { corsPreflight, getServiceClient, getUserFromRequest, json } from './_shared/supabase'

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') return corsPreflight()

  try {
    const user = await getUserFromRequest(req)
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const path = new URL(req.url).pathname
    const cancelMatch = path.match(/\/api\/bookings\/([^/]+)\/cancel$/)

    if (req.method === 'POST' && cancelMatch) {
      return await cancelBooking(req, user.id, cancelMatch[1])
    }

    if (req.method === 'POST' && (path === '/api/bookings' || path.endsWith('/bookings'))) {
      return await createBooking(req, user)
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    console.error(err)
    return json(
      { error: err instanceof Error ? err.message : 'Server error' },
      500,
    )
  }
}

async function createBooking(req: Request, user: { id: string; email?: string }) {
  const body = (await req.json()) as { slotId?: string }
  if (!body.slotId) return json({ error: 'slotId is required' }, 400)

  const supabase = getServiceClient()
  const geo = await lookupGeo(req)

  const { data: slot, error: slotError } = await supabase
    .from('time_slots')
    .select(
      'id, starts_at, ends_at, capacity, booked_count, status, studio_id, studios(code, name, shoot_type)',
    )
    .eq('id', body.slotId)
    .single()

  if (slotError || !slot) return json({ error: 'Slot not found' }, 404)
  if (slot.booked_count >= slot.capacity || slot.status === 'full') {
    return json({ error: 'This slot is full' }, 409)
  }

  const studio = Array.isArray(slot.studios) ? slot.studios[0] : slot.studios
  if (!studio) return json({ error: 'Studio missing for slot' }, 500)

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      slot_id: slot.id,
      status: 'confirmed',
      studio_name: studio.name,
      studio_code: studio.code,
      shoot_type: studio.shoot_type,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      guest_email: user.email ?? null,
      guest_name: profile?.display_name ?? null,
      ip: geo.ip,
      city: geo.city ?? null,
      region: geo.region ?? null,
      country: geo.country ?? null,
    })
    .select('*')
    .single()

  if (bookingError) {
    if (bookingError.code === '23505') {
      return json({ error: 'You already booked this slot' }, 409)
    }
    return json({ error: bookingError.message }, 400)
  }

  const { error: updateError } = await supabase
    .from('time_slots')
    .update({ booked_count: slot.booked_count + 1 })
    .eq('id', slot.id)
    .eq('booked_count', slot.booked_count)

  if (updateError) {
    await supabase.from('bookings').delete().eq('id', booking.id)
    return json({ error: 'Slot was just taken. Try another.' }, 409)
  }

  const when = new Date(slot.starts_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const location = [geo.city, geo.region, geo.country].filter(Boolean).join(', ') || 'Unknown'

  await sendDiscord(`New booking · ${studio.code}`, [
    {
      title: 'Shoot slot booked',
      color: 0xef4444,
      fields: [
        { name: 'Studio', value: `${studio.code} · ${studio.shoot_type}`, inline: true },
        { name: 'When', value: when, inline: true },
        { name: 'Guest', value: user.email || profile?.display_name || user.id, inline: true },
        { name: 'Location', value: location, inline: true },
      ],
    },
  ])

  const html = `
    <h2>Your PSLens booking is confirmed</h2>
    <p><strong>${studio.code}</strong> · ${studio.shoot_type}</p>
    <p>${when}</p>
    <p>See you at the studio.</p>
  `

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: `Confirmed: ${studio.code} on ${when}`,
      html,
    })
  }

  const notify = studioNotifyEmail()
  if (notify) {
    await sendEmail({
      to: notify,
      subject: `New booking · ${studio.code} · ${when}`,
      html: `<p>Guest: ${user.email}</p><p>Location: ${location}</p>${html}`,
    })
  }

  return json({ booking })
}

async function cancelBooking(req: Request, userId: string, bookingId: string) {
  const supabase = getServiceClient()
  const geo = await lookupGeo(req)

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('user_id', userId)
    .single()

  if (error || !booking) return json({ error: 'Booking not found' }, 404)
  if (booking.status === 'cancelled') return json({ booking })

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (updateError) return json({ error: updateError.message }, 400)

  const { data: slot } = await supabase
    .from('time_slots')
    .select('id, booked_count')
    .eq('id', booking.slot_id)
    .single()

  if (slot && slot.booked_count > 0) {
    await supabase
      .from('time_slots')
      .update({ booked_count: slot.booked_count - 1 })
      .eq('id', slot.id)
  }

  const when = new Date(booking.starts_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const location = [geo.city, geo.region, geo.country].filter(Boolean).join(', ') || 'Unknown'

  await sendDiscord(`Booking cancelled · ${booking.studio_code}`, [
    {
      title: 'Booking cancelled',
      color: 0x6b6b6b,
      fields: [
        { name: 'Studio', value: `${booking.studio_code} · ${booking.shoot_type}`, inline: true },
        { name: 'When', value: when, inline: true },
        { name: 'Guest', value: booking.guest_email || userId, inline: true },
        { name: 'Cancelled from', value: location, inline: true },
      ],
    },
  ])

  if (booking.guest_email) {
    await sendEmail({
      to: booking.guest_email,
      subject: `Cancelled: ${booking.studio_code} on ${when}`,
      html: `<p>Your booking for <strong>${booking.studio_code}</strong> on ${when} was cancelled.</p>`,
    })
  }

  const notify = studioNotifyEmail()
  if (notify) {
    await sendEmail({
      to: notify,
      subject: `Cancelled booking · ${booking.studio_code}`,
      html: `<p>${booking.guest_email} cancelled ${when}</p>`,
    })
  }

  return json({ ok: true })
}

export const config: Config = {
  path: ['/api/bookings', '/api/bookings/:id/cancel'],
}
