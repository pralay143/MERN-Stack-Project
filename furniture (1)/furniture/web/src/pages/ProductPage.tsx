import { Link, useParams } from 'react-router'
import { assetUrl, errorMessage, errorStatus } from '@/api/client'
import type { Category, Product } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Alert, Badge, Container, Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { formatPaise } from '@/lib/money'
import { useProduct, useProducts } from '@/features/products/hooks'
import { ProductCard } from '@/features/products/ProductCard'
import { NotFoundPage } from './NotFoundPage'

const RELATED_COUNT = 4

/** One product: image, details and price, then more from its category. */
export function ProductPage() {
  const { id = '' } = useParams()
  const product = useProduct(id)

  if (product.isPending) return <ProductSkeleton />

  if (product.isError) {
    // 400 is a malformed id, 404 a removed product: both are "not found" to a shopper.
    const status = errorStatus(product.error)
    if (status === 400 || status === 404) return <NotFoundPage />
    return (
      <Container className="flex flex-col items-start gap-4 py-12">
        <Alert className="w-full">{errorMessage(product.error, 'We couldn’t load this product.')}</Alert>
        <Button onClick={() => product.refetch()} loading={product.isFetching}>
          Try again
        </Button>
      </Container>
    )
  }

  const { data } = product
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs product={data} />

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-14">
        <div className="aspect-[4/3] overflow-hidden rounded-card bg-sand md:aspect-square">
          {data.file?.url && <img src={assetUrl(data.file.url)} alt={data.productName} className="size-full object-cover" />}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {data.categoryId && <Badge>{data.categoryId.categoryName}</Badge>}
            {data.brandId && <Badge>{data.brandId.brandName}</Badge>}
          </div>
          <h1 className="text-4xl leading-tight sm:text-5xl">{data.productName}</h1>
          <p className="text-2xl font-medium">{formatPaise(data.price)}</p>
          {data.description && <p className="leading-relaxed whitespace-pre-line text-muted">{data.description}</p>}

          <div className="mt-2 rounded-card border border-line bg-surface p-5 text-sm">
            <p className="font-medium">Online ordering opens soon</p>
            <p className="mt-1 text-muted">Cart and checkout are on their way. Until then, browse and shortlist your favourites.</p>
          </div>

          <Link to="/shop" className={cn(buttonClasses({ variant: 'secondary' }), 'self-start')}>
            Back to the shop
          </Link>
        </div>
      </div>

      {data.categoryId && <RelatedProducts category={data.categoryId} excludeId={data._id} />}
    </Container>
  )
}

function Breadcrumbs({ product }: { product: Product }) {
  const category = product.categoryId
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/shop" className="hover:text-walnut">
            Shop
          </Link>
        </li>
        {category && (
          <li className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link to={`/shop?category=${category._id}`} className="hover:text-walnut">
              {category.categoryName}
            </Link>
          </li>
        )}
        <li className="flex items-center gap-2">
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-ink">
            {product.productName}
          </span>
        </li>
      </ol>
    </nav>
  )
}

/** Up to four other products from the same category (the shop's first page for it). */
function RelatedProducts({ category, excludeId }: { category: Category; excludeId: string }) {
  const related = useProducts({ q: '', category: category._id, brand: '', sort: 'newest', page: 1 })
  const items = related.data?.data.filter((p) => p._id !== excludeId).slice(0, RELATED_COUNT) ?? []
  if (items.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="mt-20">
      <div className="flex items-end justify-between gap-4">
        <h2 id="related-heading" className="text-2xl">
          More {category.categoryName.toLowerCase()}
        </h2>
        <Link to={`/shop?category=${category._id}`} className="text-sm font-medium text-walnut hover:underline">
          See all
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p._id} className="flex">
            <ProductCard product={p} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProductSkeleton() {
  return (
    <Container className="py-8 sm:py-12">
      <div role="status">
        <span className="sr-only">Loading product…</span>
        <Skeleton className="h-4 w-48" />
        <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-14">
          <Skeleton className="aspect-[4/3] rounded-card md:aspect-square" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </Container>
  )
}
