import { Outlet, ScrollRestoration } from 'react-router'
import { AccountActions } from '@/features/auth/AccountActions'
import { CartLink } from '@/features/cart/CartLink'
import { CartSync } from '@/features/cart/CartSync'
import { Footer } from './Footer'
import { Header } from './Header'

/** Header, page content and footer, shared by every page. */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-walnut px-4 py-2 text-cream focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header actions={<AccountActions />} cart={<CartLink />} />
      <CartSync />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
