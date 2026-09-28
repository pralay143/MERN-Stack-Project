import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Container } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { parseFilters, withFilter, withPage, type FilterKey } from '@/features/products/filters'
import { useProducts } from '@/features/products/hooks'
import { Pagination } from '@/features/products/Pagination'
import { ProductCard } from '@/features/products/ProductCard'
import { ShopToolbar } from '@/features/products/ShopToolbar'

/** The catalogue: search, filter, sort and page, all driven by the URL. */
export function ShopPage() {
  const [params, setParams] = useSearchParams()
  // Parsed per distinct query string, so the query key only changes when the URL does.
  const search = params.toString()
  const filters = useMemo(() => parseFilters(new URLSearchParams(search)), [search])
  const products = useProducts(filters)
  const meta = products.data?.meta

  // Filters keep the scroll position; typing replaces the history entry so
  // Back doesn't step through every keystroke.
  const setFilter = useCallback(
    (key: FilterKey, value: string, options?: { typing?: boolean }) =>
      setParams((prev) => withFilter(prev, key, value), { replace: options?.typing, preventScrollReset: true }),
    [setParams],
  )

  // A page past the end (e.g. an old link after products were removed) moves to the last page.
  useEffect(() => {
    if (meta && !products.isPlaceholderData && meta.total > 0 && filters.page > meta.pages) {
      setParams((prev) => withPage(prev, meta.pages), { replace: true })
    }
  }, [meta, products.isPlaceholderData, filters.page, setParams])

  return (
    <Container className="py-10 sm:py-12">
      <h1 className="text-4xl">Shop</h1>
      <p className="mt-2 text-muted">{meta ? resultSummary(meta.total, filters.q) : 'Handmade and hand-picked furniture.'}</p>

      <div className="mt-8">
        <ShopToolbar filters={filters} onChange={setFilter} />
      </div>

      {products.data && (
        <section
          aria-label="Products"
          aria-busy={products.isFetching}
          className={cn('mt-8 transition-opacity', products.isPlaceholderData && 'opacity-60')}
        >
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.data.data.map((product) => (
              <li key={product._id} className="flex">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Pagination page={filters.page} pages={meta?.pages ?? 1} />
          </div>
        </section>
      )}
    </Container>
  )
}

function resultSummary(total: number, q: string): string {
  const count = `${total} ${total === 1 ? 'piece' : 'pieces'}`
  return q ? `${count} matching “${q}”` : count
}
