import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useCurrentUser } from '@/features/auth/hooks'
import { mergeCart } from './api'
import { readGuestCart, writeGuestCart } from './guestCart'
import { cartKeys } from './hooks'
import { isMerging, setMerging } from './mergeState'

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
    // One merge at a time: StrictMode runs effects twice in development, and
    // a second merge would add the quantities again.
    if (!userId || items.length === 0 || isMerging()) return
    setMerging(true)
    mergeCart(items)
      .then(async (cart) => {
        writeGuestCart([])
        queryClient.setQueryData(cartKeys.all, cart)
        // Checkout may have loaded before the merge finished.
        await queryClient.invalidateQueries({ queryKey: ['checkout'] })
      })
      // On failure the browser cart is kept, and merged at the next login.
      .catch(() => {})
      .finally(() => setMerging(false))
  }, [userId, queryClient])

  return null
}
