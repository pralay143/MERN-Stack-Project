import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useCurrentUser } from '@/features/auth/hooks'
import { mergeCart } from './api'
import { readGuestCart, writeGuestCart } from './guestCart'
import { cartKeys } from './hooks'

// One merge at a time (StrictMode runs effects twice in development, and a
// second merge would add the quantities again).
let merging = false

/**
 * When someone logs in or signs up with items in their browser cart, those
 * items move into their account's cart. Renders nothing.
 */
export function CartSync() {
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  const userId = user?._id

  useEffect(() => {
    const items = readGuestCart()
    if (!userId || items.length === 0 || merging) return
    merging = true
    mergeCart(items)
      .then((cart) => {
        writeGuestCart([])
        queryClient.setQueryData(cartKeys.all, cart)
      })
      // On failure the browser cart is kept, and merged at the next login.
      .catch(() => {})
      .finally(() => {
        merging = false
      })
  }, [userId, queryClient])

  return null
}
