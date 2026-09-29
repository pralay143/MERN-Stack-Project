import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { HomePage } from '@/pages/HomePage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

/** A lazily loaded page shown only to admins. */
async function adminPage(page: Promise<ComponentType>) {
  const Page = await page
  return {
    Component: () => (
      <RequireAuth roles={['Admin']}>
        <Page />
      </RequireAuth>
    ),
  }
}

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
      { path: 'cart', lazy: () => import('@/pages/CartPage').then((m) => ({ Component: m.CartPage })) },
      {
        path: 'checkout',
        lazy: () =>
          import('@/pages/CheckoutPage').then(({ CheckoutPage }) => ({
            Component: () => (
              <RequireAuth>
                <CheckoutPage />
              </RequireAuth>
            ),
          })),
      },
      {
        path: 'orders',
        lazy: () =>
          import('@/pages/OrdersPage').then(({ OrdersPage }) => ({
            Component: () => (
              <RequireAuth>
                <OrdersPage />
              </RequireAuth>
            ),
          })),
      },
      {
        path: 'orders/:id',
        lazy: () =>
          import('@/pages/OrderPage').then(({ OrderPage }) => ({
            Component: () => (
              <RequireAuth>
                <OrderPage />
              </RequireAuth>
            ),
          })),
      },
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
      {
        // Sellers and admins. The layout checks the role; admin-only pages check again.
        path: 'dashboard',
        lazy: () => import('@/features/dashboard/DashboardLayout').then((m) => ({ Component: m.DashboardLayout })),
        children: [
          { index: true, element: <Navigate to="products" replace /> },
          { path: 'products', lazy: () => import('@/features/dashboard/ProductsPage').then((m) => ({ Component: m.ProductsPage })) },
          { path: 'products/new', lazy: () => import('@/features/dashboard/ProductFormPage').then((m) => ({ Component: m.NewProductPage })) },
          {
            path: 'products/:id/edit',
            lazy: () => import('@/features/dashboard/ProductFormPage').then((m) => ({ Component: m.EditProductPage })),
          },
          { path: 'orders', lazy: () => import('@/features/dashboard/SoldOrdersPage').then((m) => ({ Component: m.SoldOrdersPage })) },
          { path: 'categories', lazy: () => adminPage(import('@/features/dashboard/CategoriesPage').then((m) => m.CategoriesPage)) },
          { path: 'brands', lazy: () => adminPage(import('@/features/dashboard/BrandsPage').then((m) => m.BrandsPage)) },
          { path: 'users', lazy: () => adminPage(import('@/features/dashboard/UsersPage').then((m) => m.UsersPage)) },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
