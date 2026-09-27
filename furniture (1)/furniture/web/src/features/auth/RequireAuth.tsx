import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import type { RoleName } from '@/api/types'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Container } from '@/components/ui/misc'
import { Spinner } from '@/components/ui/Spinner'
import { hasRole, useCurrentUser } from './hooks'
import { loginPathFor } from './redirect'

/**
 * Shows `children` only to logged-in users (and, with `roles`, only to those
 * roles). Logged-out visitors go to the login page and come back afterwards.
 * The API enforces the same rules; this just gives a better experience.
 */
export function RequireAuth({ roles, children }: { roles?: RoleName[]; children: ReactNode }) {
  const { user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <Container className="flex justify-center py-24">
        <Spinner label="Checking your account" />
      </Container>
    )
  }

  if (!user) return <Navigate to={loginPathFor(location.pathname + location.search)} replace />

  if (roles && !hasRole(user, ...roles)) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-4xl">This page isn’t available to your account</h1>
        <p className="max-w-md text-muted">If you think that’s a mistake, contact the store admin.</p>
        <Link to="/" className={buttonClasses({ variant: 'secondary' })}>
          Go home
        </Link>
      </Container>
    )
  }

  return children
}
