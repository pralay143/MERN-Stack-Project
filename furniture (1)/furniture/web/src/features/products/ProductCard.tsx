import { Link } from 'react-router'
import { assetUrl } from '@/api/client'
import type { Product } from '@/api/types'
import { formatPaise } from '@/lib/money'
import { stockStatus } from '@/lib/stock'

/** A product tile linking to its page. Use headingLevel="h3" inside a section headed by an h2. */
export function ProductCard({ product, headingLevel: Heading = 'h2' }: { product: Product; headingLevel?: 'h2' | 'h3' }) {
  const image = assetUrl(product.file?.url)
  const maker = product.brandId?.brandName ?? product.categoryId?.categoryName
  const stock = stockStatus(product.stock)

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-lg hover:shadow-walnut/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {stock.tone === 'out' && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-ink/80 px-2.5 py-0.5 text-xs font-medium text-cream">Sold out</span>
        )}
        {image && (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {maker && <p className="text-xs tracking-wide text-muted uppercase">{maker}</p>}
        <Heading className="font-display text-lg leading-snug group-hover:text-walnut">{product.productName}</Heading>
        <p className="mt-auto flex items-baseline justify-between gap-2 pt-2">
          <span className="font-medium">{formatPaise(product.price)}</span>
          {stock.tone === 'low' && <span className="text-xs font-medium text-terracotta">{stock.label}</span>}
        </p>
      </div>
    </Link>
  )
}
