import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProfileAvatar() {
  const { profile, user } = useAuth()
  const initial = profile?.initial || user?.email?.[0]?.toUpperCase() || 'R'

  return (
    <Link to="/auth" className="avatar" aria-label="Account">
      {initial}
    </Link>
  )
}
