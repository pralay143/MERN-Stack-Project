import { Link } from 'react-router'
import { assetUrl } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Alert, Container, EmptyState, Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { formatPaise } from '@/lib/money'
import { DELIVERY_FEE, FREE_DELIVERY_FROM } from '@/lib/shop'
import { cartErrorMessage, maxQuantity, useCart, useCartActions } from '@/features/cart/hooks'
import { QuantitySelect } from '@/features/cart/QuantitySelect'
import type { CartLine } from '@/features/cart/types'

export function CartPage() {
  const { cart, isLoading, error } = useCart()
  const actions = useCartActions()
  const failed = [actions.set, actions.remove].find((m) => m.isError)

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-4xl">Your cart</h1>

      {isLoading ? (
        <div role="status" className="mt-8 flex flex-col gap-3">
          <span className="sr-only">Loading your cart…</span>
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : error || !cart ? (
        <Alert className="mt-8">{cartErrorMessage(error)}</Alert>
      ) : cart.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            action={
              <Link to="/shop" className={buttonClasses()}>
                Browse furniture
              </Link>
            }
          >
            Find something you love and it will show up here.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[2fr_1fr]">
          <section aria-label="Items" className="flex flex-col gap-4">
            {failed && <Alert>{cartErrorMessage(failed.error)}</Alert>}
            {cart.hasProblems && (
              <Alert>Some items are sold out or have fewer left than you chose. Update them to check out.</Alert>
            )}
            <ul className="divide-y divide-line rounded-card border border-line bg-surface">
              {cart.items.map((line) => (
                <CartItem key={line.product._id} line={line} actions={actions} />
              ))}
            </ul>
          </section>

          <Summary subtotal={cart.subtotal} itemCount={cart.itemCount} blocked={cart.hasProblems} />
        </div>
      )}
    </Container>
  )
}

function CartItem({ line, actions }: { line: CartLine; actions: ReturnType<typeof useCartActions> }) {
  const { product, quantity, lineTotal, problem } = line
  const image = assetUrl(product.file?.url)
  const busy = (actions.set.isPending && actions.set.variables?.product._id === product._id) || (actions.remove.isPending && actions.remove.variables === product._id)

  return (
    <li className={cn('flex gap-4 p-4 sm:gap-6 sm:p-5', busy && 'opacity-60')}>
      <Link to={`/products/${product._id}`} className="size-24 shrink-0 overflow-hidden rounded-xl bg-sand sm:size-28">
        {image && <img src={image} alt="" className="size-full object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link to={`/products/${product._id}`} className="font-display text-lg leading-snug hover:text-walnut">
            {product.productName}
          </Link>
          <p className="text-sm text-muted">{formatPaise(product.price)} each</p>
          {problem === 'out_of_stock' && <p className="mt-1 text-sm font-medium text-danger">Sold out: remove it to check out</p>}
          {problem === 'not_enough_stock' && (
            <p className="mt-1 text-sm font-medium text-danger">Only {product.stock} left: lower the quantity</p>
          )}
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <p className="font-medium sm:order-last">{formatPaise(lineTotal)}</p>
          <div className="flex items-center gap-2">
            {problem !== 'out_of_stock' && (
              <QuantitySelect
                label={`Quantity of ${product.productName}`}
                value={quantity}
                max={maxQuantity(product)}
                disabled={busy}
                onChange={(q) => actions.set.mutate({ product, quantity: q })}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              aria-label={`Remove ${product.productName}`}
              onClick={() => actions.remove.mutate(product._id)}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}

function Summary({ subtotal, itemCount, blocked }: { subtotal: number; itemCount: number; blocked: boolean }) {
  const freeDelivery = subtotal >= FREE_DELIVERY_FROM
  const delivery = freeDelivery ? 0 : DELIVERY_FEE

  return (
    <aside aria-labelledby="summary-heading" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6 lg:sticky lg:top-24">
      <h2 id="summary-heading" className="text-xl">
        Order summary
      </h2>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd>{formatPaise(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Delivery</dt>
          <dd>{freeDelivery ? 'Free' : formatPaise(delivery)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPaise(subtotal + delivery)}</dd>
        </div>
      </dl>
      {!freeDelivery && (
        <p className="rounded-xl bg-walnut-light px-3 py-2 text-sm text-walnut-dark">
          Add {formatPaise(FREE_DELIVERY_FROM - subtotal)} more for free delivery.
        </p>
      )}
      {blocked ? (
        <Button size="lg" fullWidth disabled>
          Checkout
        </Button>
      ) : (
        <Link to="/checkout" className={buttonClasses({ size: 'lg', fullWidth: true })}>
          Checkout
        </Link>
      )}
      <p className="text-xs text-muted">Prices include GST. You’ll confirm the delivery address next.</p>
    </aside>
  )
}
