import { createBrowserRouter } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage as Placeholder } from '@/pages/PlaceholderPage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Placeholder title="Home" /> },
      { path: 'shop', element: <Placeholder title="Shop" /> },
      { path: 'products/:id', element: <Placeholder title="Product" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
