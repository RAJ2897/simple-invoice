import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api/client'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retrying a 4xx never helps; network blips get one more try
        retry: (failureCount, error) => {
          const status = error instanceof ApiError ? error.status : 0
          return status === 0 && failureCount < 1
        },
      },
    },
  })
}
