import { NavLink, Outlet } from 'react-router'
import { Container } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { hasRole, useCurrentUser } from '@/features/auth/hooks'
import { RequireAuth } from '@/features/auth/RequireAuth'

const sections = [
  { to: 'products', label: 'Products', adminOnly: false },
  { to: 'categories', label: 'Categories', adminOnly: true },
  { to: 'brands', label: 'Brands', adminOnly: true },
  { to: 'users', label: 'Users', adminOnly: true },
]

/** Shell for /dashboard: sellers manage their products, admins the whole store. */
export function DashboardLayout() {
  return (
    <RequireAuth roles={['Vendor', 'Admin']}>
      <DashboardShell />
    </RequireAuth>
  )
}

function DashboardShell() {
  const { user } = useCurrentUser()
  const isAdmin = hasRole(user, 'Admin')

  return (
    <Container className="py-10">
      <p className="text-sm font-medium tracking-widest text-terracotta uppercase">{isAdmin ? 'Store admin' : 'Seller dashboard'}</p>
      <nav aria-label="Dashboard" className="mt-4 -mx-1 overflow-x-auto border-b border-line">
        <ul className="flex min-w-max gap-1 px-1">
          {sections
            .filter((s) => isAdmin || !s.adminOnly)
            .map((s) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  className={({ isActive }) =>
                    cn(
                      '-mb-px inline-block border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                      isActive ? 'border-walnut text-walnut' : 'border-transparent text-muted hover:text-ink',
                    )
                  }
                >
                  {s.label}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </Container>
  )
}