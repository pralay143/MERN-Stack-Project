import { Link } from 'react-router'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Container } from '@/components/ui/misc'

export function NotFoundPage() {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-sm font-medium tracking-widest text-terracotta uppercase">404</p>
      <h1 className="text-4xl">We can’t find that page</h1>
      <p className="max-w-md text-muted">It may have moved, or the link might be mistyped.</p>
      <Link to="/shop" className={buttonClasses()}>
        Browse furniture
      </Link>
    </Container>
  )
}
