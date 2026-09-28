import { Skeleton } from '@/components/ui/misc'
import { PAGE_SIZE } from './api'

/** Card-shaped placeholders in the same grid as the products. */
export function ProductGridSkeleton() {
  return (
    <div role="status" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <span className="sr-only">Loading products…</span>
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
