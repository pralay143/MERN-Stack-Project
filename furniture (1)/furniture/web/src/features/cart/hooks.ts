import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useSyncExternalStore } from 'react'
import { errorMessage, errorStatus } from '@/api/client'
import type { Id } from '@/api/types'
import { MAX_QUANTITY_PER_ITEM } from '@/lib/shop'
import { useCurrentUser } from '@/features/auth/hooks'
import { fetchProduct } from '@/features/products/api'
import { productKeys } from '@/features/products/hooks'
import { clearCart, fetchCart, removeCartItem, setCartQuantity } from './api'
import { readGuestCart, removeGuestItem, setGuestQuantity, subscribeGuestCart, writeGuestCart } from './guestCart'
import type { Cart, CartLine, CartProduct } from './types'

export const cartKeys = { all: ['cart'] as const }

const EMPTY: never[] = []

/** Builds a cart from lines, the same way the API does (for guest carts). */
export function buildCart(lines: Array<{ product: CartProduct; quantity: number }>): Cart {
  const items: CartLine[] = lines.map(({ product, quantity }) => ({
    product,
    quantity,
    lineTotal: product.price * quantity,
    problem: product.stock <= 0 ? 'out_of_stock' : quantity > product.stock ? 'not_enough_stock' : null,
  }))
  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    hasProblems: items.some((item) => item.problem),
  }
}

/**
 * The current cart: the account's (from the API) when logged in, otherwise
 * the browser's, with each product's current details fetched. `cart` is
 * undefined while loading.
 */
export function useCart() {
  const { user, isLoading: checkingUser } = useCurrentUser()
  const server = useQuery({ queryKey: cartKeys.all, queryFn: fetchCart, enabled: Boolean(user) })
  const guestItems = useSyncExternalStore(subscribeGuestCart, readGuestCart, () => EMPTY)
  const stored = user ? EMPTY : guestItems

  const products = useQueries({
    queries: stored.map((item) => ({
      queryKey: productKeys.detail(item.productId),
      queryFn: () => fetchProduct(item.productId),
      retry: false,
    })),
  })

  // Products that no longer exist are dropped from the browser cart.
  const goneIds = stored
    .filter((_, i) => {
      const status = errorStatus(products[i]?.error)
      return status === 400 || status === 404
    })
    .map((item) => item.productId)
  const goneKey = goneIds.join(',')
  useEffect(() => {
    if (goneKey) goneKey.split(',').forEach(removeGuestItem)
  }, [goneKey])

  if (user) return { cart: server.data, isLoading: server.isPending, error: server.error, isGuest: false }

  const loading = checkingUser || products.some((p) => p.isPending)
  const failed = products.find((p) => p.isError && !goneIds.includes(stored[products.indexOf(p)]?.productId))
  const cart = loading
    ? undefined
    : buildCart(stored.flatMap((item, i) => (products[i]?.data ? [{ product: products[i].data, quantity: item.quantity }] : [])))
  return { cart, isLoading: loading, error: failed?.error ?? null, isGuest: true }
}

/** Most of this product that can go in the cart. */
export const maxQuantity = (product: Pick<CartProduct, 'stock'>) => Math.max(0, Math.min(product.stock, MAX_QUANTITY_PER_ITEM))

/** Thrown before a request when a quantity can't possibly be bought. */
export class CartLimitError extends Error {}

function checkQuantity(product: CartProduct, quantity: number) {
  if (product.stock <= 0) throw new CartLimitError(`${product.productName} is sold out`)
  if (quantity > product.stock) throw new CartLimitError(`Only ${product.stock} left of ${product.productName}`)
  if (quantity > MAX_QUANTITY_PER_ITEM) throw new CartLimitError(`You can buy up to ${MAX_QUANTITY_PER_ITEM} of one product`)
}

/** A message for any error from the cart actions. */
export const cartErrorMessage = (error: unknown) => (error instanceof CartLimitError ? error.message : errorMessage(error))

/** Add, change and remove cart lines, for the account or the browser cart. */
export function useCartActions() {
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  const saveCart = (cart: Cart | null) => {
    if (cart) queryClient.setQueryData(cartKeys.all, cart)
  }

  const currentQuantity = (productId: Id) =>
    user
      ? (queryClient.getQueryData<Cart>(cartKeys.all)?.items.find((item) => item.product._id === productId)?.quantity ?? 0)
      : (readGuestCart().find((item) => item.productId === productId)?.quantity ?? 0)

  async function setQuantity({ product, quantity }: { product: CartProduct; quantity: number }) {
    checkQuantity(product, quantity)
    if (user) return setCartQuantity(product._id, quantity)
    setGuestQuantity(product._id, quantity)
    return null
  }

  const set = useMutation({ mutationFn: setQuantity, onSuccess: saveCart })

  const add = useMutation({
    mutationFn: ({ product, quantity = 1 }: { product: CartProduct; quantity?: number }) =>
      setQuantity({ product, quantity: currentQuantity(product._id) + quantity }),
    onSuccess: saveCart,
  })

  const remove = useMutation({
    mutationFn: async (productId: Id) => {
      if (user) return removeCartItem(productId)
      removeGuestItem(productId)
      return null
    },
    onSuccess: saveCart,
  })

  const clear = useMutation({
    mutationFn: async () => {
      if (user) return clearCart()
      writeGuestCart([])
      return null
    },
    onSuccess: saveCart,
  })

  return { set, add, remove, clear }
}
