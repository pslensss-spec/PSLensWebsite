import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AuthPage() {
  const { user, profile, signInWithOtp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signInWithOtp(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send magic link')
    } finally {
      setBusy(false)
    }
  }

  if (user) {
    return (
      <div>
        <div className="header-row fade-in">
          <div>
            <p className="eyebrow">Account</p>
            <h1 className="page-title">Signed in</h1>
          </div>
          <div className="avatar" aria-hidden>
            {profile?.initial || user.email?.[0]?.toUpperCase() || 'R'}
          </div>
        </div>
        <section className="card fade-in">
          <p style={{ margin: 0 }}>
            <strong>{profile?.display_name || 'Guest'}</strong>
          </p>
          <p className="small muted" style={{ marginTop: 6 }}>
            {user.email}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn btn--primary" onClick={() => navigate(from)}>
              Continue →
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void signOut().then(() => navigate('/'))}
            >
              Sign out
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <div className="header-row fade-in">
        <div>
          <p className="eyebrow">PSLens</p>
          <h1 className="page-title">Sign in</h1>
        </div>
        <Link to="/" className="btn btn--ghost" style={{ padding: '10px 14px' }}>
          Close
        </Link>
      </div>

      <section className="card fade-in" style={{ marginBottom: 18 }}>
        <p className="small muted" style={{ margin: 0 }}>
          Enter your email and we’ll send a magic link. No password needed.
        </p>
      </section>

      {sent ? (
        <div className="toast toast--ok fade-in">
          Check your inbox for a sign-in link. You can close this tab after clicking it.
        </div>
      ) : (
        <form className="fade-in" onSubmit={(e) => void onSubmit(e)}>
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Sending…' : 'Email magic link →'}
          </button>
        </form>
      )}

      {error ? <div className="toast toast--error">{error}</div> : null}
    </div>
  )
}
