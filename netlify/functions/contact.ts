import type { Config } from '@netlify/functions'
import { sendDiscord } from './_shared/discord'
import { sendEmail, studioNotifyEmail } from './_shared/email'
import { lookupGeo } from './_shared/geo'
import { corsPreflight, getServiceClient, getUserFromRequest, json } from './_shared/supabase'

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return corsPreflight()
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const user = await getUserFromRequest(req)
    const body = (await req.json()) as {
      name?: string
      email?: string
      message?: string
    }

    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      return json({ error: 'name, email, and message are required' }, 400)
    }

    const geo = await lookupGeo(req)
    const supabase = getServiceClient()

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        user_id: user?.id ?? null,
        name: body.name.trim(),
        email: body.email.trim(),
        message: body.message.trim(),
        ip: geo.ip,
        city: geo.city ?? null,
        region: geo.region ?? null,
        country: geo.country ?? null,
      })
      .select('id')
      .single()

    if (error) return json({ error: error.message }, 400)

    const location = [geo.city, geo.region, geo.country].filter(Boolean).join(', ') || 'Unknown'

    await sendDiscord('New contact message', [
      {
        title: 'Studio contact',
        color: 0xd4a84b,
        fields: [
          { name: 'From', value: `${body.name.trim()} <${body.email.trim()}>`, inline: false },
          { name: 'Message', value: body.message.trim().slice(0, 1000), inline: false },
          { name: 'Location', value: location, inline: true },
        ],
      },
    ])

    const notify = studioNotifyEmail()
    if (notify) {
      await sendEmail({
        to: notify,
        subject: `Contact · ${body.name.trim()}`,
        html: `
          <p><strong>From:</strong> ${body.name.trim()} &lt;${body.email.trim()}&gt;</p>
          <p><strong>Location:</strong> ${location}</p>
          <p>${body.message.trim().replace(/\n/g, '<br/>')}</p>
        `,
      })
    }

    await sendEmail({
      to: body.email.trim(),
      subject: 'We received your message · PSLens',
      html: `<p>Thanks ${body.name.trim()} — the studio desk got your note and will reply soon.</p>`,
    })

    return json({ id: data.id, ok: true })
  } catch (err) {
    console.error(err)
    return json(
      { error: err instanceof Error ? err.message : 'Server error' },
      500,
    )
  }
}

export const config: Config = {
  path: '/api/contact',
}
