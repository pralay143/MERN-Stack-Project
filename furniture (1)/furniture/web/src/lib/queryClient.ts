import { QueryClient } from '@tanstack/react-query'
import { errorStatus } from '@/api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Catalogue data changes rarely; avoid refetching on every mount.
      staleTime: 60_000,
      // Retry network hiccups and server errors, never 4xx (they won't change).
      retry: (failureCount, error) => {
        const status = errorStatus(error)
        if (status !== undefined && status < 500) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
  },
})
