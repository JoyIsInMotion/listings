import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'

type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (email: string) => void
  register: (name: string, email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const value = useMemo<AuthContextValue>(  
    () => ({
      user,
      login: (email: string) => {
        setUser({
          id: 'u1',
          name: 'Book Seller',
          email,
        })
      },
      register: (name: string, email: string) => {
        setUser({
          id: 'u1',
          name,
          email,
        })
      },
      logout: () => setUser(null),
    }),
    [user],
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
