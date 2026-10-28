import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithOtp: (email: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, initial')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return
    await loadProfile(session.user.id)
  }, [loadProfile, session?.user?.id])

  useEffect(() => {
    let mounted = true

    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return
        setSession(data.session)
        if (data.session?.user) {
          void loadProfile(data.session.user.id).finally(() => {
            if (mounted) setLoading(false)
          })
        } else {
          setLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next?.user) {
        void loadProfile(next.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signInWithOtp = useCallback(async (email: string) => {
    if (!supabaseConfigured) throw new Error('Supabase is not configured on this deploy')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signInWithOtp,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signInWithOtp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
