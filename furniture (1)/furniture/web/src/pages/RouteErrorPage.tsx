import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Container } from '@/components/ui/misc'
import { NotFoundPage } from './NotFoundPage'

/** Shown when a page crashes, instead of a blank screen. */
export function RouteErrorPage() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  console.error(error)
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="max-w-md text-muted">Please reload the page. If it keeps happening, try again later.</p>
      <div className="flex gap-3">
        <button type="button" className={buttonClasses()} onClick={() => window.location.reload()}>
          Reload
        </button>
        <Link to="/" className={buttonClasses({ variant: 'secondary' })}>
          Go home
        </Link>
      </div>
    </Container>
  )
}
