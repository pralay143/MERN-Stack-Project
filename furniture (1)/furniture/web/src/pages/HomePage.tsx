import { Link } from 'react-router'
import { assetUrl } from '@/api/client'
import type { Product } from '@/api/types'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Container, Skeleton } from '@/components/ui/misc'
import { useCategories, useProducts } from '@/features/products/hooks'
import { ProductCard } from '@/features/products/ProductCard'

// The shop's default first page, so Home and /shop share one cached request.
const NEWEST = { q: '', category: '', brand: '', sort: 'newest', page: 1 } as const

const promises = [
  { title: 'Made by independent makers', text: 'Every piece comes from a workshop we know, not a faceless factory.' },
  { title: 'Solid materials', text: 'Sheesham, teak, oak and rattan, finished to be used every day.' },
  { title: 'Honest prices', text: 'The price you see is the price you pay. No inflated “before” prices.' },
]

export function HomePage() {
  const newest = useProducts(NEWEST)
  const products = newest.data?.data ?? []

  return (
    <>
      <Hero images={products.slice(0, 3)} loading={newest.isPending} />

      <Container className="py-16">
        <CategoryTiles />
      </Container>

      <Container className="pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl">New arrivals</h2>
          <Link to="/shop?sort=newest" className="text-sm font-medium text-walnut hover:underline">
            See all
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newest.isPending
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i}>
                  <Skeleton className="aspect-[4/5] rounded-card" />
                </li>
              ))
            : products.slice(0, 4).map((p) => (
                <li key={p._id} className="flex">
                  <ProductCard product={p} headingLevel="h3" />
                </li>
              ))}
        </ul>
        {newest.isError && <p className="mt-6 text-muted">New arrivals couldn’t be loaded just now. The shop may still work.</p>}
      </Container>

      <section aria-labelledby="promises-heading" className="border-y border-line bg-sand">
        <Container className="py-14">
          <h2 id="promises-heading" className="sr-only">
            Why shop with us
          </h2>
          <ul className="grid gap-8 sm:grid-cols-3">
            {promises.map((p) => (
              <li key={p.title}>
                <h3 className="text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  )
}

function Hero({ images, loading }: { images: Product[]; loading: boolean }) {
  return (
    <Container className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
      <div className="flex flex-col items-start gap-6">
        <p className="text-sm font-medium tracking-widest text-terracotta uppercase">Furniture for every room</p>
        <h1 className="text-5xl leading-[1.05] sm:text-6xl">Pieces made to be lived with.</h1>
        <p className="max-w-md text-lg text-muted">
          Sofas, beds, dining sets and chairs from independent Indian makers. Built to last, priced fairly.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/shop" className={buttonClasses({ size: 'lg' })}>
            Shop all furniture
          </Link>
          <Link to="/shop?sort=newest" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            New arrivals
          </Link>
        </div>
      </div>

      {/* Decorative collage of the newest products; the grid below links to them. */}
      <div aria-hidden="true" className="grid h-72 grid-cols-2 grid-rows-2 gap-3 sm:h-96">
        {[0, 1, 2].map((i) => {
          const url = assetUrl(images[i]?.file?.url)
          return (
            <div key={i} className={i === 0 ? 'row-span-2 overflow-hidden rounded-card bg-sand' : 'overflow-hidden rounded-card bg-sand'}>
              {loading ? <Skeleton className="size-full" /> : url && <img src={url} alt="" className="size-full object-cover" />}
            </div>
          )
        })}
      </div>
    </Container>
  )
}

function CategoryTiles() {
  const categories = useCategories()
  const active = categories.data?.filter((c) => c.isActive) ?? []
  if (categories.isError || (categories.data && active.length === 0)) return null

  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="text-3xl">
        Shop by category
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.isPending
          ? Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-20 rounded-card" />
              </li>
            ))
          : active.map((c) => (
              <li key={c._id}>
                <Link
                  to={`/shop?category=${c._id}`}
                  className="flex h-20 items-center justify-between rounded-card border border-line bg-surface px-5 font-display text-lg transition-colors hover:border-walnut hover:text-walnut"
                >
                  {c.categoryName}
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  )
}
