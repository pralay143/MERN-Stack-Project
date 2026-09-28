import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { HomePage } from '@/pages/HomePage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

// Pages with forms are loaded on demand, so the form and validation
// libraries aren't in the first download.
export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', lazy: () => import('@/pages/AboutPage').then((m) => ({ Component: m.AboutPage })) },
      { path: 'shop', lazy: () => import('@/pages/ShopPage').then((m) => ({ Component: m.ShopPage })) },
      { path: 'products/:id', lazy: () => import('@/pages/ProductPage').then((m) => ({ Component: m.ProductPage })) },
      { path: 'login', lazy: () => import('@/pages/LoginPage').then((m) => ({ Component: m.LoginPage })) },
      { path: 'register', lazy: () => import('@/pages/RegisterPage').then((m) => ({ Component: m.RegisterPage })) },
      {
        path: 'account',
        lazy: () =>
          import('@/pages/AccountPage').then(({ AccountPage }) => ({
            Component: () => (
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            ),
          })),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
