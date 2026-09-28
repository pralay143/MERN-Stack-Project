import { Link } from 'react-router'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Container } from '@/components/ui/misc'

export function AboutPage() {
  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <p className="text-sm font-medium tracking-widest text-terracotta uppercase">About us</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">A marketplace for furniture that lasts.</h1>

      <div className="mt-8 flex flex-col gap-5 text-lg leading-relaxed text-muted">
        <p>
          E-Furniture brings together independent furniture makers and the people furnishing their homes. Makers list their pieces
          here; you browse by room, brand and price, and see exactly what you’re getting.
        </p>
        <p>
          We favour solid materials, honest prices and pieces built to be used every day, not replaced every few years.
        </p>
      </div>

      <section aria-labelledby="sell-heading" className="mt-12 rounded-card border border-line bg-surface p-6 sm:p-8">
        <h2 id="sell-heading" className="text-2xl">
          Sell with us
        </h2>
        <p className="mt-3 text-muted">
          Are you a maker? Create an account, then ask the store admin to switch it to a seller account. You’ll get a dashboard to
          list your pieces, update prices and photos, and take items down.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/register" className={buttonClasses()}>
            Create an account
          </Link>
          <Link to="/shop" className={buttonClasses({ variant: 'secondary' })}>
            Browse the shop
          </Link>
        </div>
      </section>

      <p className="mt-12 text-sm text-muted">
        E-Furniture is a portfolio project. Online ordering (cart and checkout) is still being built.
      </p>
    </Container>
  )
}
