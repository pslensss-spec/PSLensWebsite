import { useEffect, useState, type FormEvent } from 'react'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { useAuth } from '../hooks/useAuth'
import { sendContact } from '../lib/api'

export function ContactPage() {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name)
    if (user?.email) setEmail(user.email)
  }, [profile?.display_name, user?.email])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; text: string } | null>(
    null,
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFeedback(null)
    setBusy(true)
    try {
      await sendContact({ name, email, message })
      setFeedback({ type: 'ok', text: 'Message sent. We’ll get back to you soon.' })
      setMessage('')
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not send message',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="header-row fade-in">
        <div>
          <p className="eyebrow">Studio desk</p>
          <h1 className="page-title">Contact</h1>
        </div>
        <ProfileAvatar />
      </div>

      <section className="card fade-in" style={{ marginBottom: 18 }}>
        <p className="small muted" style={{ margin: 0 }}>
          Questions about Studio 04 reel shoots, availability, or custom packages? Send a note —
          we notify the studio by email and Discord.
        </p>
      </section>

      <form className="fade-in" onSubmit={(e) => void onSubmit(e)}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
          />
        </div>
        <div className="field">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Tell us what you need…"
          />
        </div>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Sending…' : 'Send message →'}
        </button>
      </form>

      {feedback ? <div className={`toast toast--${feedback.type}`}>{feedback.text}</div> : null}
    </div>
  )
}
