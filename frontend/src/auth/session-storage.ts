import type { UserProfile } from '../types/api'

const KEY = 'simple-invoice.session'

export interface StoredSession {
  token: string
  /** epoch milliseconds */
  expiresAt: number
  user: UserProfile
}

/**
 * The access token is kept in localStorage so a refresh doesn't log the user out.
 * Trade-off (documented in the README): anything stored here is readable by
 * scripts on the page, so the token is short-lived and dropped on expiry.
 */
export const sessionStore = {
  read(): StoredSession | null {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return null
      const session = JSON.parse(raw) as StoredSession
      if (!session.token || session.expiresAt <= Date.now()) {
        localStorage.removeItem(KEY)
        return null
      }
      return session
    } catch {
      localStorage.removeItem(KEY)
      return null
    }
  },

  write(session: StoredSession) {
    localStorage.setItem(KEY, JSON.stringify(session))
  },

  clear() {
    localStorage.removeItem(KEY)
  },
}
