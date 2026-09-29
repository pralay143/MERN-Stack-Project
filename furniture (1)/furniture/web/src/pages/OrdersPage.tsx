import { Link, useSearchParams } from 'react-router'
import { assetUrl, errorMessage } from '@/api/client'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Alert, Container, EmptyState, Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { formatPaise } from '@/lib/money'
import { useMyOrders } from '@/features/orders/hooks'
import { OrderStatusBadge } from '@/features/orders/OrderStatusBadge'

/** /orders: the customer's orders, newest first. */
export function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const orders = useMyOrders(page)

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-4xl">Your orders</h1>

      {orders.isPending ? (
        <div role="status" className="mt-8 flex flex-col gap-3">
          <span className="sr-only">Loading orders…</span>
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : orders.isError ? (
        <Alert className="mt-8">{errorMessage(orders.error, 'We couldn’t load your orders.')}</Alert>
      ) : orders.data.data.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No orders yet"
            action={
              <Link to="/shop" className={buttonClasses()}>
                Browse furniture
              </Link>
            }
          >
            When you buy something, it’ll show up here.
          </EmptyState>
        </div>
      ) : (
        <>
          <ul className={cn('mt-8 flex flex-col gap-3', orders.isPlaceholderData && 'opacity-60')}>
            {orders.data.data.map((order) => (
              <li key={order._id}>
                <Link
                  to={`/orders/${order._id}`}
                  className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface p-4 transition-shadow hover:shadow-md sm:p-5"
                >
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.product} className="size-14 overflow-hidden rounded-lg border-2 border-surface bg-sand">
                        {item.imageUrl && <img src={assetUrl(item.imageUrl)} alt="" className="size-full object-cover" />}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Order {order.orderNumber}</p>
                    <p className="text-sm text-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ·{' '}
                      {order.items.reduce((n, i) => n + i.quantity, 0)} items
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-medium">{formatPaise(order.total ?? 0)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {orders.data.meta.pages > 1 && (
            <nav aria-label="Pages" className="mt-6 flex items-center justify-between text-sm">
              <button
                type="button"
                className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                disabled={page <= 1}
                onClick={() => setParams({ page: String(page - 1) })}
              >
                Newer
              </button>
              <span className="text-muted">
                Page {page} of {orders.data.meta.pages}
              </span>
              <button
                type="button"
                className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                disabled={page >= orders.data.meta.pages}
                onClick={() => setParams({ page: String(page + 1) })}
              >
                Older
              </button>
            </nav>
          )}
        </>
      )}
    </Container>
  )
}
