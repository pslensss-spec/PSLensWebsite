import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MobileShell } from './components/MobileShell'
import { AuthProvider } from './hooks/useAuth'
import { AuthPage } from './pages/AuthPage'
import { BookingsPage } from './pages/BookingsPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { supabaseConfigured } from './lib/supabase'
import './styles/tokens.css'

export default function App() {
  return (
    <AuthProvider>
      {!supabaseConfigured ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: '#7f1d1d',
            color: '#fff',
            padding: '10px 14px',
            fontSize: 13,
            textAlign: 'center',
          }}
        >
          Missing Netlify env: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.
        </div>
      ) : null}
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
