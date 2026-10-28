import { Resend } from 'resend'
import { optionalEnv } from './env'

export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  html: string
}) {
  const apiKey = optionalEnv('RESEND_API_KEY')
  const from = optionalEnv('RESEND_FROM_EMAIL') || 'PSLens <onboarding@resend.dev>'
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set; skipping email')
    return
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
  if (error) console.error('Resend error', error)
}

export function studioNotifyEmail() {
  return optionalEnv('STUDIO_NOTIFY_EMAIL')
}
