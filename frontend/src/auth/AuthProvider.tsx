import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as loginRequest } from '../api/auth'
import { setUnauthorizedHandler } from '../api/client'
import { AuthContext, type AuthContextValue, type LogoutReason } from './auth-context'
import { sessionStore, type StoredSession } from './session-storage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<StoredSession | null>(() => sessionStore.read())

  const logout = useCallback(
    (reason: LogoutReason = 'manual') => {
      sessionStore.clear()
      setSession(null)
      queryClient.clear()
      if (reason === 'expired') {
        notifications.show({
          id: 'session-expired',
          color: 'yellow',
          title: 'Session expired',
          message: 'Please sign in again to continue.',
        })
      }
    },
    [queryClient],
  )

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password)
    const next: StoredSession = {
      token: result.accessToken,
      expiresAt: Date.now() + result.expiresIn * 1000,
      user: result.user,
    }
    sessionStore.write(next)
    setSession(next)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => logout('expired'))
    return () => setUnauthorizedHandler(null)
  }, [logout])

  // Sign out right when the token expires instead of waiting for the next failing request
  useEffect(() => {
    if (!session) return
    // setTimeout overflows above ~24.8 days and would fire immediately
    const delay = Math.min(session.expiresAt - Date.now(), 2 ** 31 - 1)
    const timer = window.setTimeout(() => logout('expired'), delay)
    return () => window.clearTimeout(timer)
  }, [session, logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
