import { useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { assetUrl, errorMessage } from '@/api/client'
import type { Product } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Alert, EmptyState, Skeleton } from '@/components/ui/misc'
import { SearchField } from '@/components/ui/SearchField'
import { cn } from '@/lib/cn'
import { formatPaise } from '@/lib/money'
import { stockStatus } from '@/lib/stock'
import { hasRole, useCurrentUser } from '@/features/auth/hooks'
import { parseFilters, withFilter } from '@/features/products/filters'
import { useProducts } from '@/features/products/hooks'
import { Pagination } from '@/features/products/Pagination'
import { useDeleteProduct } from './hooks'

/** Sellers see their own products; admins see every product in the store. */
export function ProductsPage() {
  const { user } = useCurrentUser()
  const isAdmin = hasRole(user, 'Admin')
  const [params, setParams] = useSearchParams()
  const notice = (useLocation().state as { notice?: string } | null)?.notice
  const search = params.toString()
  const filters = useMemo(() => parseFilters(new URLSearchParams(search)), [search])
  const products = useProducts({ ...filters, seller: isAdmin ? undefined : user?._id })
  const remove = useDeleteProduct()

  function confirmDelete(product: Product) {
    if (window.confirm(`Delete “${product.productName}”? Shoppers will no longer see it. This can’t be undone.`)) {
      remove.mutate(product._id)
    }
  }

  const rows = products.data?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">{isAdmin ? 'All products' : 'Your products'}</h1>
          {products.data && (
            <p className="mt-1 text-sm text-muted">
              {products.data.meta.total} {products.data.meta.total === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
        <Link to="new" className={buttonClasses()}>
          Add product
        </Link>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {notice}
        </p>
      )}
      {remove.isError && <Alert>{errorMessage(remove.error, 'The product couldn’t be deleted.')}</Alert>}

      <div className="max-w-md">
        <SearchField
          label="Search products"
          value={filters.q}
          onSearch={(q) => setParams((prev) => withFilter(prev, 'q', q), { replace: true, preventScrollReset: true })}
        />
      </div>

      {products.isPending ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">Loading products…</span>
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : products.isError ? (
        <div className="flex flex-col items-start gap-3">
          <Alert className="w-full">{errorMessage(products.error, 'We couldn’t load the products.')}</Alert>
          <Button variant="secondary" onClick={() => products.refetch()}>
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={filters.q ? 'No products match your search' : 'No products yet'}
          action={
            !filters.q && (
              <Link to="new" className={buttonClasses()}>
                Add your first product
              </Link>
            )
          }
        >
          {filters.q ? 'Try a different word.' : 'Products you add appear in the shop straight away.'}
        </EmptyState>
      ) : (
        <>
          <div className={cn('overflow-x-auto rounded-card border border-line bg-surface', products.isPlaceholderData && 'opacity-60')}>
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Stock
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                          {product.file?.url && <img src={assetUrl(product.file.url)} alt="" className="size-full object-cover" />}
                        </div>
                        <Link to={`/products/${product._id}`} className="font-medium hover:text-walnut">
                          {product.productName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{product.categoryId?.categoryName ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPaise(product.price)}</td>
                    <td className={cn('px-4 py-3 text-right', product.stock <= 0 ? 'text-danger' : stockStatus(product.stock).tone === 'low' && 'text-terracotta')}>
                      {product.stock <= 0 ? 'Sold out' : product.stock}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`${product._id}/edit`}
                          className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                          aria-label={`Edit ${product.productName}`}
                        >
                          Edit
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger"
                          loading={remove.isPending && remove.variables === product._id}
                          onClick={() => confirmDelete(product)}
                          aria-label={`Delete ${product.productName}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={filters.page} pages={products.data.meta.pages} />
        </>
      )}
    </div>
  )
}
