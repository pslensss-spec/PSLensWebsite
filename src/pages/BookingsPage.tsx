import { Link } from 'react-router-dom'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { googleFormConfigured, googleFormUrl } from '../lib/googleForm'

export function BookingsPage() {
  return (
    <div>
      <div className="header-row fade-in">
        <div>
          <p className="eyebrow">Your schedule</p>
          <h1 className="page-title">Bookings</h1>
        </div>
        <ProfileAvatar />
      </div>

      <section className="card fade-in">
        <p style={{ marginTop: 0 }}>
          Shoot requests are collected through our intake form. After you submit, the studio will
          confirm your slot by email.
        </p>
        {googleFormConfigured && googleFormUrl ? (
          <a
            className="btn btn--primary"
            href={googleFormUrl}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: 8 }}
          >
            Open request form →
          </a>
        ) : (
          <Link to="/contact" className="btn btn--primary" style={{ marginTop: 8, display: 'inline-flex' }}>
            Go to Contact →
          </Link>
        )}
      </section>
    </div>
  )
}
