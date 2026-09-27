import { Link } from 'react-router'
import { Container } from '@/components/ui/misc'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-sand">
      <Container className="grid gap-10 py-12 sm:grid-cols-[2fr_1fr]">
        <div className="flex max-w-sm flex-col gap-3">
          <p className="font-display text-xl">E-Furniture</p>
          <p className="text-sm text-muted">
            Furniture for every room, from independent Indian makers. Built to last, priced fairly.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <p className="font-medium">Shop</p>
          <Link to="/shop" className="text-muted hover:text-walnut">
            All furniture
          </Link>
          <Link to="/shop?sort=newest" className="text-muted hover:text-walnut">
            New arrivals
          </Link>
        </nav>
      </Container>
      <Container className="border-t border-line py-6 text-xs text-muted">
        © {new Date().getFullYear()} E-Furniture. A portfolio project.
      </Container>
    </footer>
  )
}
