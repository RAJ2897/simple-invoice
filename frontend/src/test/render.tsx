import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { AppProviders } from '../AppProviders'
import { sessionStore } from '../auth/session-storage'
import { routes } from '../routes'
import type { UserProfile } from '../types/api'

export const testUser: UserProfile = {
  id: 'ad1e0902-1928-4345-b513-60c86c94fc91',
  email: 'admin@simpleinvoice.dev',
  fullname: 'Admin User',
  createdAt: '2026-01-01T00:00:00.000Z',
}

export function signIn() {
  sessionStore.write({ token: 'test-token', expiresAt: Date.now() + 3_600_000, user: testUser })
}

/** Renders the real route tree at `path`, with every app-level provider. */
export function renderApp(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })

  const result = render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return { ...result, router, queryClient }
}
