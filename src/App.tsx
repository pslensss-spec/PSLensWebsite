import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MobileShell } from './components/MobileShell'
import { AuthProvider } from './hooks/useAuth'
import { AuthPage } from './pages/AuthPage'
import { BookingsPage } from './pages/BookingsPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import './styles/tokens.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MobileShell />}>
            <Route index element={<HomePage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
