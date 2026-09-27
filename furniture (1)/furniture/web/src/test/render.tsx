import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'

/**
 * Renders `ui` at `path` inside a fresh query client and an in-memory router.
 * Extra routes (e.g. { path: '/', element: <p>Home</p> }) let tests check
 * where a page navigates to.
 */
export function renderRoute(
  ui: ReactNode,
  { path = '/', at = path, routes = [] }: { path?: string; at?: string; routes?: Array<{ path: string; element: ReactNode }> } = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const router = createMemoryRouter([{ path, element: ui }, ...routes], { initialEntries: [at] })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router, queryClient }
}
