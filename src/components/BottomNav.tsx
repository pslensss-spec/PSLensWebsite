import { NavLink } from 'react-router-dom'

interface BottomNavProps {
  bookingCount?: number
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BookingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ContactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 12h15" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="12" cy="12" rx="3.5" ry="8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function BottomNav({ bookingCount = 0 }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
      >
        <span className="nav-item__icon">
          <HomeIcon />
        </span>
        Home
      </NavLink>
      <NavLink
        to="/bookings"
        className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
      >
        {bookingCount > 0 ? <span className="nav-badge">{bookingCount}</span> : null}
        <span className="nav-item__icon">
          <BookingsIcon />
        </span>
        Bookings
      </NavLink>
      <NavLink
        to="/contact"
        className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
      >
        <span className="nav-item__icon">
          <ContactIcon />
        </span>
        Contact
      </NavLink>
    </nav>
  )
}
