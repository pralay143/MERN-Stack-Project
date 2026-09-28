import { Link } from 'react-router'
import { assetUrl } from '@/api/client'
import type { Product } from '@/api/types'
import { formatPaise } from '@/lib/money'

export function ProductCard({ product }: { product: Product }) {
  const image = assetUrl(product.file?.url)
  const maker = product.brandId?.brandName ?? product.categoryId?.categoryName

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-lg hover:shadow-walnut/5"
    >
      <div className="aspect-[4/3] overflow-hidden bg-sand">
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
        <h2 className="font-display text-lg leading-snug group-hover:text-walnut">{product.productName}</h2>
        <p className="mt-auto pt-2 font-medium">{formatPaise(product.price)}</p>
      </div>
    </Link>
  )
}
