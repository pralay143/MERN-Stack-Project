import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { Container } from '@/components/ui/misc'
import { Logo } from './Logo'
import { SearchBox } from './SearchBox'

const navLinks = [
  { to: '/shop', label: 'Shop all', isActive: (path: string, sort: string | null) => path === '/shop' && sort !== 'newest' },
  { to: '/shop?sort=newest', label: 'New arrivals', isActive: (path: string, sort: string | null) => path === '/shop' && sort === 'newest' },
  { to: '/about', label: 'About', isActive: (path: string) => path === '/about' },
]

// NavLink ignores the query string, so active state is worked out here.
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname, search } = useLocation()
  const sort = new URLSearchParams(search).get('sort')
  return navLinks.map((link) => {
    const active = link.isActive(pathname, sort)
    return (
      <Link
        key={link.to}
        to={link.to}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn('text-sm font-medium transition-colors hover:text-walnut', active ? 'text-walnut' : 'text-ink')}
      >
        {link.label}
      </Link>
    )
  })
}

/**
 * Site header. `actions` is the right-hand area (account links), moved into
 * the menu on small screens; `cart` stays visible at every size.
 */
export function Header({ actions, cart }: { actions?: ReactNode; cart?: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>

        <SearchBox className="ml-auto hidden w-72 lg:block" />

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden items-center gap-2 md:flex">{actions}</div>
          {cart}
        </div>

        <button
          type="button"
          className="-ml-4 inline-flex size-10 items-center justify-center rounded-full hover:bg-sand md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </Container>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            <SearchBox onSearch={closeMenu} />
            <nav aria-label="Mobile" className="flex flex-col gap-3">
              <NavLinks onNavigate={closeMenu} />
            </nav>
            {actions && (
              <div className="flex items-center gap-2 border-t border-line pt-4" onClick={closeMenu}>
                {actions}
              </div>
            )}
          </Container>
        </div>
      )}
    </header>
  )
}
