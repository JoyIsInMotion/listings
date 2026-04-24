import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session, AuthChangeEvent, User } from '@supabase/supabase-js'
import { supabase } from './supabase.ts'

type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser | null>
  register: (name: string, email: string, password: string) => Promise<AuthUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function toAuthUser(sessionUser: User | null | undefined): AuthUser | null {
  if (!sessionUser) {
    return null
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email ?? '',
    name:
      sessionUser.user_metadata?.name ??
      sessionUser.email?.split('@')[0] ??
      'Book Seller',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        if (!active) {
          return
        }

        setUser(toAuthUser(data.session?.user))
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      setUser(toAuthUser(session?.user))
      setLoading(false)
      },
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(  
    () => ({
      user,
      loading,
      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          throw error
        }

        const nextUser = toAuthUser(data.session?.user)
        setUser(nextUser)

        return nextUser
      },
      register: async (name: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        })

        if (error) {
          throw error
        }

        const nextUser = toAuthUser(data.session?.user)
        setUser(nextUser)

        return nextUser
      },
      logout: async () => {
        const { error } = await supabase.auth.signOut()

        if (error) {
          throw error
        }

        setUser(null)
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
