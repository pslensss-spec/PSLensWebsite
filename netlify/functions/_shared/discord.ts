import { optionalEnv } from './env'

export async function sendDiscord(content: string, embeds?: object[]) {
  const webhook = optionalEnv('DISCORD_WEBHOOK_URL')
  if (!webhook) {
    console.warn('DISCORD_WEBHOOK_URL not set; skipping Discord notify')
    return
  }

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, embeds }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Discord webhook failed', res.status, text)
  }
}
