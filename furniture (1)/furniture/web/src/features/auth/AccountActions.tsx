import { Link, useNavigate } from 'react-router'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Button } from '@/components/ui/Button'
import { useCurrentUser, useLogout } from './hooks'

/** Header links: log in / sign up, or the account link and log out. */
export function AccountActions() {
  const { user, isLoading } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  // Avoid flashing "Log in" for a moment while the session is checked.
  if (isLoading) return <div className="h-9 w-32" aria-hidden="true" />

  if (!user) {
    return (
      <>
        <Link to="/login" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
          Log in
        </Link>
        <Link to="/register" className={buttonClasses({ size: 'sm' })}>
          Sign up
        </Link>
      </>
    )
  }

  return (
    <>
      <Link to="/account" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
        <span className="flex size-6 items-center justify-center rounded-full bg-walnut-light text-xs font-semibold text-walnut-dark">
          {user.name.charAt(0).toUpperCase()}
        </span>
        {user.name.split(' ')[0]}
      </Link>
      <Button
        variant="secondary"
        size="sm"
        loading={logout.isPending}
        onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/') })}
      >
        Log out
      </Button>
    </>
  )
}
