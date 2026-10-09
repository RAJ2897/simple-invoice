import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './auth-context'

/** Guards every private route; remembers where the user was heading. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
