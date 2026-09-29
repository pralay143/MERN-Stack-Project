import { useState } from 'react'
import { Link } from 'react-router'
import { assetUrl, errorMessage } from '@/api/client'
import type { Id } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Alert, Container, EmptyState, Skeleton } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { formatPaise } from '@/lib/money'
import { AddressForm, AddressLines } from '@/features/addresses/AddressForm'
import { useAddresses } from '@/features/addresses/hooks'
import { useCurrentUser } from '@/features/auth/hooks'
import { useCartMerging } from '@/features/cart/mergeState'
import { useCheckoutSummary } from '@/features/checkout/hooks'
import type { CheckoutSummary } from '@/features/checkout/api'

/** /checkout (logged in): choose where to deliver and review the order. */
export function CheckoutPage() {
  const { user } = useCurrentUser()
  const addresses = useAddresses()
  const [chosenId, setChosenId] = useState<Id | undefined>()
  const [adding, setAdding] = useState(false)
  const summary = useCheckoutSummary(chosenId)
  // Right after logging in, the browser cart may still be moving into the account.
  const merging = useCartMerging()

  if (summary.isPending || addresses.isPending || merging) {
    return (
      <Container className="py-12">
        <div role="status" className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <span className="sr-only">Loading checkout…</span>
          <Skeleton className="h-80" />
          <Skeleton className="h-64" />
        </div>
      </Container>
    )
  }

  const error = summary.error ?? addresses.error
  if (error || !summary.data) {
    return (
      <Container className="flex flex-col items-start gap-4 py-12">
        <Alert className="w-full">{errorMessage(error, 'We couldn’t load checkout.')}</Alert>
        <Button onClick={() => Promise.all([summary.refetch(), addresses.refetch()])}>Try again</Button>
      </Container>
    )
  }

  const data = summary.data
  if (data.items.length === 0) {
    return (
      <Container className="py-12">
        <EmptyState
          title="Your cart is empty"
          action={
            <Link to="/shop" className={buttonClasses()}>
              Browse furniture
            </Link>
          }
        >
          Add something to your cart to check out.
        </EmptyState>
      </Container>
    )
  }

  const saved = addresses.data ?? []
  const selectedId = data.address?._id
  const showForm = adding || saved.length === 0

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="text-4xl">Checkout</h1>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="delivery-heading" className="rounded-card border border-line bg-surface p-6">
            <h2 id="delivery-heading" className="text-xl">
              1. Delivery address
            </h2>

            {saved.length > 0 && (
              <fieldset className="mt-4 flex flex-col gap-3">
                <legend className="sr-only">Choose a delivery address</legend>
                {saved.map((address) => (
                  <label
                    key={address._id}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors',
                      address._id === selectedId ? 'border-walnut bg-walnut-light/40' : 'border-line hover:bg-sand/40',
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1 size-4 accent-walnut"
                      checked={address._id === selectedId}
                      onChange={() => setChosenId(address._id)}
                    />
                    <AddressLines address={address} />
                    {address.isDefault && <span className="ml-auto self-start text-xs font-medium text-walnut">Default</span>}
                  </label>
                ))}
              </fieldset>
            )}

            <div className="mt-4">
              {showForm ? (
                <AddressForm
                  defaultName={user?.name}
                  canBeDefault={saved.length > 0}
                  onCancel={saved.length > 0 ? () => setAdding(false) : undefined}
                  onSaved={(address) => {
                    setChosenId(address._id)
                    setAdding(false)
                  }}
                />
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
                  Add a new address
                </Button>
              )}
            </div>
          </section>

          <section aria-labelledby="items-heading" className="rounded-card border border-line bg-surface p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="items-heading" className="text-xl">
                2. Items
              </h2>
              <Link to="/cart" className="text-sm font-medium text-walnut hover:underline">
                Edit cart
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {data.items.map(({ product, quantity, lineTotal, problem }) => (
                <li key={product._id} className="flex items-center gap-4 py-3">
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {product.file?.url && <img src={assetUrl(product.file.url)} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-muted">Qty {quantity}</p>
                    {problem && <p className="text-sm text-danger">{problem === 'out_of_stock' ? 'Sold out' : `Only ${product.stock} left`}</p>}
                  </div>
                  <p className="font-medium">{formatPaise(lineTotal)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <OrderSummary data={data} updating={summary.isFetching} />
      </div>
    </Container>
  )
}

function OrderSummary({ data, updating }: { data: CheckoutSummary; updating: boolean }) {
  return (
    <aside
      aria-labelledby="summary-heading"
      className={cn('flex flex-col gap-4 rounded-card border border-line bg-surface p-6 lg:sticky lg:top-24', updating && 'opacity-70')}
    >
      <h2 id="summary-heading" className="text-xl">
        Order summary
      </h2>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">
            Subtotal ({data.itemCount} {data.itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd>{formatPaise(data.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Delivery</dt>
          <dd>{data.deliveryFee === 0 ? 'Free' : formatPaise(data.deliveryFee)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatPaise(data.total)}</dd>
        </div>
      </dl>

      {data.blockers.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">
          {data.blockers.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}

      <Button size="lg" fullWidth disabled>
        Pay {formatPaise(data.total)}
      </Button>
      <p className="text-xs text-muted">
        {data.canPlaceOrder ? 'Online payment is being connected; ordering opens very soon.' : 'Sort out the points above to continue.'}{' '}
        Prices include GST.
      </p>
    </aside>
  )
}
