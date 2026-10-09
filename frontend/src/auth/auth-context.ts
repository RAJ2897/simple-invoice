import { createContext, useContext } from 'react'
import type { UserProfile } from '../types/api'

export type LogoutReason = 'manual' | 'expired'

export interface AuthContextValue {
  user: UserProfile | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: (reason?: LogoutReason) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
