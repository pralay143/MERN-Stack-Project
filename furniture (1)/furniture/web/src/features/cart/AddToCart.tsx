import { useState } from 'react'
import { Link } from 'react-router'
import type { Product } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/misc'
import { cartErrorMessage, maxQuantity, useCart, useCartActions } from './hooks'
import { QuantitySelect } from './QuantitySelect'

/** Quantity picker and "Add to cart" for the product page. */
export function AddToCart({ product }: { product: Product }) {
  const { cart } = useCart()
  const { add } = useCartActions()
  const [quantity, setQuantity] = useState(1)
  const inCart = cart?.items.find((item) => item.product._id === product._id)?.quantity ?? 0
  // What can still be added, given what's already in the cart.
  const addable = Math.max(0, maxQuantity(product) - inCart)

  if (product.stock <= 0) {
    return (
      <Button size="lg" disabled className="self-start">
        Sold out
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {addable > 0 && (
          <QuantitySelect
            label={`Quantity of ${product.productName}`}
            value={Math.min(quantity, addable)}
            max={addable}
            onChange={setQuantity}
          />
        )}
        <Button
          size="lg"
          loading={add.isPending}
          disabled={addable === 0}
          onClick={() => add.mutate({ product, quantity: Math.min(quantity, addable) }, { onSuccess: () => setQuantity(1) })}
        >
          {addable === 0 ? 'Most you can buy is in your cart' : 'Add to cart'}
        </Button>
      </div>
      {add.isError && <Alert>{cartErrorMessage(add.error)}</Alert>}
      {inCart > 0 && (
        <p role="status" className="text-sm text-muted">
          {inCart} in your cart ·{' '}
          <Link to="/cart" className="font-medium text-walnut hover:underline">
            View cart
          </Link>
        </p>
      )}
    </div>
  )
}
