import { useSearchParams } from 'react-router'
import { assetUrl, errorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { SelectField } from '@/components/ui/Field'
import { Alert, EmptyState, Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { formatPaise } from '@/lib/money'
import { hasRole, useCurrentUser } from '@/features/auth/hooks'
import { useCancelOrder, useSoldOrders, useUpdateItemStatus } from '@/features/orders/hooks'
import { OrderStatusBadge } from '@/features/orders/OrderStatusBadge'
import { STATUS_LABELS } from '@/features/orders/status'
import type { Order, OrderItem, OrderStatus } from '@/features/orders/types'

const SELLER_STATUSES: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled']
const ADMIN_STATUSES: OrderStatus[] = ['pending_payment', ...SELLER_STATUSES]

/** /dashboard/orders: sellers fulfil their items; admins see and manage every order. */
export function SoldOrdersPage() {
  const { user } = useCurrentUser()
  const isAdmin = hasRole(user, 'Admin')
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const statuses = isAdmin ? ADMIN_STATUSES : SELLER_STATUSES
  const status = (statuses as string[]).includes(params.get('status') ?? '') ? (params.get('status') as OrderStatus) : ''
  const orders = useSoldOrders(page, status)
  const updateItem = useUpdateItemStatus()
  const cancel = useCancelOrder()
  const failed = [updateItem, cancel].find((m) => m.isError)

  const setFilter = (next: Record<string, string>) =>
    setParams((prev) => {
      const merged = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(next)) {
        if (value) merged.set(key, value)
        else merged.delete(key)
      }
      return merged
    })

  function confirmCancel(order: Order) {
    const message = `Cancel order ${order.orderNumber}? The items go back into stock. Refund ${formatPaise(order.total ?? 0)} to the customer from the Razorpay dashboard.`
    if (window.confirm(message)) cancel.mutate(order._id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">{isAdmin ? 'All orders' : 'Your orders to fulfil'}</h1>
          <p className="mt-1 text-muted">
            {isAdmin ? 'Every order in the store, newest first.' : 'Paid orders that include your products. Mark each item as it ships and arrives.'}
          </p>
        </div>
        <div className="w-56">
          <SelectField label="Status" value={status} onChange={(e) => setFilter({ status: e.target.value, page: '' })}>
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {failed && <Alert>{errorMessage(failed.error)}</Alert>}

      {orders.isPending ? (
        <div role="status" className="flex flex-col gap-3">
          <span className="sr-only">Loading orders…</span>
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : orders.isError ? (
        <Alert>{errorMessage(orders.error, 'We couldn’t load the orders.')}</Alert>
      ) : orders.data.data.length === 0 ? (
        <EmptyState title={status ? `No ${STATUS_LABELS[status].toLowerCase()} orders` : 'No orders yet'}>
          {isAdmin ? 'Orders appear here as soon as customers place them.' : 'When customers pay for your products, the orders appear here.'}
        </EmptyState>
      ) : (
        <>
          <ul className={cn('flex flex-col gap-4', orders.isPlaceholderData && 'opacity-60')}>
            {orders.data.data.map((order) => (
              <li key={order._id} className="rounded-card border border-line bg-surface">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">Order {order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} ·{' '}
                      {typeof order.user === 'object' ? `${order.user.name} (${order.user.email})` : order.address.fullName}
                    </p>
                    <p className="text-sm text-muted">
                      Deliver to {order.address.fullName}, {[order.address.line1, order.address.line2].filter(Boolean).join(', ')},{' '}
                      {order.address.city}, {order.address.state} {order.address.pincode} · {order.address.phone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-medium">{formatPaise(order.total ?? order.sellerTotal ?? 0)}</p>
                    {isAdmin && order.status === 'processing' && order.items.every((i) => i.status === 'processing') && (
                      <Button variant="ghost" size="sm" onClick={() => confirmCancel(order)} loading={cancel.isPending && cancel.variables === order._id}>
                        Cancel order
                      </Button>
                    )}
                  </div>
                </div>
                <ul className="divide-y divide-line">
                  {order.items.map((item) => (
                    <ItemRow key={item.product} order={order} item={item} update={updateItem} />
                  ))}
                </ul>
                {order.cancelReason && <p className="border-t border-line px-5 py-3 text-sm text-muted">Cancelled: {order.cancelReason}</p>}
              </li>
            ))}
          </ul>
          {orders.data.meta.pages > 1 && (
            <nav aria-label="Pages" className="flex items-center justify-between text-sm">
              <button type="button" className={buttonClasses({ variant: 'secondary', size: 'sm' })} disabled={page <= 1} onClick={() => setFilter({ page: String(page - 1) })}>
                Newer
              </button>
              <span className="text-muted">
                Page {page} of {orders.data.meta.pages}
              </span>
              <button
                type="button"
                className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                disabled={page >= orders.data.meta.pages}
                onClick={() => setFilter({ page: String(page + 1) })}
              >
                Older
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

function ItemRow({ order, item, update }: { order: Order; item: OrderItem; update: ReturnType<typeof useUpdateItemStatus> }) {
  const canFulfil = order.status === 'processing' || order.status === 'shipped'
  const next = item.status === 'processing' ? 'shipped' : item.status === 'shipped' ? 'delivered' : null
  const busy = update.isPending && update.variables?.orderId === order._id && update.variables.productId === item.product

  return (
    <li className="flex flex-wrap items-center gap-4 px-5 py-3">
      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-sand">
        {item.imageUrl && <img src={assetUrl(item.imageUrl)} alt="" className="size-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.productName}</p>
        <p className="text-sm text-muted">
          {item.quantity} × {formatPaise(item.unitPrice)}
        </p>
      </div>
      {canFulfil && <OrderStatusBadge status={item.status} />}
      {canFulfil && next && (
        <Button
          variant="secondary"
          size="sm"
          loading={busy}
          onClick={() => update.mutate({ orderId: order._id, productId: item.product, status: next })}
          aria-label={`Mark ${item.productName} ${next}`}
        >
          Mark {next}
        </Button>
      )}
    </li>
  )
}
