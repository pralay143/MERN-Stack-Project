import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { assetUrl, errorMessage, errorStatus } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Alert, Container, Skeleton } from '@/components/ui/misc'
import { formatPaise } from '@/lib/money'
import { UNPAID_ORDER_MINUTES } from '@/lib/shop'
import { OrderPaymentError, useCancelOrder, useOrder, usePayOrder } from '@/features/orders/hooks'
import { OrderStatusBadge } from '@/features/orders/OrderStatusBadge'
import { orderStatusLabel } from '@/features/orders/status'
import type { Order } from '@/features/orders/types'
import { NotFoundPage } from './NotFoundPage'

/** How the customer got here, from checkout or a payment attempt. */
export type OrderNotice = { notice: 'paid' | 'unpaid' } | { notice: 'error'; message: string }

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

/** /orders/:id: one of the customer's orders. */
export function OrderPage() {
  const { id = '' } = useParams()
  const order = useOrder(id)
  const state = useLocation().state as OrderNotice | null
  const pay = usePayOrder()
  const cancel = useCancelOrder()
  const navigate = useNavigate()

  if (order.isPending) {
    return (
      <Container className="py-12">
        <div role="status" className="flex flex-col gap-4">
          <span className="sr-only">Loading order…</span>
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-64" />
        </div>
      </Container>
    )
  }
  if (order.isError) {
    const status = errorStatus(order.error)
    if (status === 400 || status === 404) return <NotFoundPage />
    return (
      <Container className="py-12">
        <Alert>{errorMessage(order.error, 'We couldn’t load this order.')}</Alert>
      </Container>
    )
  }

  const data = order.data
  const payAgain = () =>
    pay.mutate(
      { orderId: data._id },
      {
        onSuccess: ({ outcome }) => navigate('.', { replace: true, state: { notice: outcome === 'paid' ? 'paid' : 'unpaid' } }),
      },
    )
  const confirmCancel = () => {
    if (window.confirm('Cancel this order? The items go back on sale.')) cancel.mutate(data._id)
  }
  const payError = pay.error instanceof OrderPaymentError ? pay.error.message : pay.error && errorMessage(pay.error)

  return (
    <Container className="py-10 sm:py-14">
      <Link to="/orders" className="text-sm text-muted hover:text-walnut">
        ← Your orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-4xl">Order {data.orderNumber}</h1>
        <OrderStatusBadge status={data.status} />
      </div>
      <p className="mt-1 text-muted">Placed {formatDate(data.createdAt)}</p>

      <div className="mt-6 flex flex-col gap-3">
        {state?.notice === 'paid' && data.status !== 'pending_payment' && (
          <div role="status" className="rounded-card border border-success/30 bg-success/10 px-5 py-4">
            <p className="font-medium text-success">Thank you! Your payment was received.</p>
            <p className="text-sm text-muted">We’ll let you know as each item ships.</p>
          </div>
        )}
        {state?.notice === 'error' && <Alert>{state.message}</Alert>}
        {payError && <Alert>{payError}</Alert>}
        {cancel.isError && <Alert>{errorMessage(cancel.error)}</Alert>}
        {data.status === 'cancelled' && data.cancelReason && (
          <p className="rounded-card bg-sand px-5 py-4 text-sm">This order was cancelled: {data.cancelReason}.</p>
        )}
      </div>

      {data.status === 'pending_payment' && (
        <section aria-label="Complete payment" className="mt-6 flex flex-col gap-3 rounded-card border border-terracotta/30 bg-surface p-6">
          <p className="font-medium">{state?.notice === 'unpaid' ? 'Payment wasn’t completed.' : 'This order is waiting for payment.'}</p>
          <p className="text-sm text-muted">
            We’re holding your items for {UNPAID_ORDER_MINUTES} minutes from when you placed the order. After that it’s cancelled
            automatically.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={payAgain} loading={pay.isPending}>
              Pay {formatPaise(data.total ?? 0)}
            </Button>
            <Button variant="ghost" onClick={confirmCancel} loading={cancel.isPending}>
              Cancel order
            </Button>
          </div>
        </section>
      )}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[2fr_1fr]">
        <section aria-labelledby="items-heading" className="rounded-card border border-line bg-surface p-6">
          <h2 id="items-heading" className="text-xl">
            Items
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {data.items.map((item) => (
              <li key={item.product} className="flex items-center gap-4 py-3">
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {item.imageUrl && <img src={assetUrl(item.imageUrl)} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${item.product}`} className="font-medium hover:text-walnut">
                    {item.productName}
                  </Link>
                  <p className="text-sm text-muted">
                    {item.quantity} × {formatPaise(item.unitPrice)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-medium">{formatPaise(item.lineTotal)}</p>
                  {['processing', 'shipped', 'delivered'].includes(data.status) && <OrderStatusBadge status={item.status} />}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex flex-col gap-6">
          <Totals order={data} />
          <section aria-labelledby="address-heading" className="rounded-card border border-line bg-surface p-6 text-sm">
            <h2 id="address-heading" className="text-xl">
              Delivery address
            </h2>
            <p className="mt-3 font-medium">{data.address.fullName}</p>
            <p className="text-muted">{[data.address.line1, data.address.line2, data.address.landmark].filter(Boolean).join(', ')}</p>
            <p className="text-muted">
              {data.address.city}, {data.address.state} {data.address.pincode}
            </p>
            <p className="text-muted">Mobile: {data.address.phone}</p>
          </section>
          <section aria-labelledby="history-heading" className="rounded-card border border-line bg-surface p-6 text-sm">
            <h2 id="history-heading" className="text-xl">
              History
            </h2>
            <ol className="mt-3 flex flex-col gap-3 border-l border-line pl-4">
              {data.statusHistory.map((entry, i) => (
                <li key={i}>
                  <p className="font-medium">{orderStatusLabel(entry.status)}</p>
                  <p className="text-muted">
                    {formatDate(entry.at)}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </Container>
  )
}

function Totals({ order }: { order: Order }) {
  if (order.total === undefined) return null
  return (
    <section aria-labelledby="totals-heading" className="rounded-card border border-line bg-surface p-6">
      <h2 id="totals-heading" className="text-xl">
        Payment
      </h2>
      <dl className="mt-3 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPaise(order.subtotal ?? 0)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Delivery</dt>
          <dd>{order.deliveryFee ? formatPaise(order.deliveryFee) : 'Free'}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPaise(order.total)}</dd>
        </div>
      </dl>
      {order.payment?.paidAt && <p className="mt-3 text-xs text-muted">Paid {formatDate(order.payment.paidAt)} via Razorpay</p>}
    </section>
  )
}
