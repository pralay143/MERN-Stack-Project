import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/client'
import type { Id } from '@/api/types'
import { openRazorpayCheckout, PaymentDismissedError } from '@/lib/razorpay'
import { cartKeys } from '@/features/cart/hooks'
import { productKeys } from '@/features/products/hooks'
import {
  cancelOrder,
  fetchMyOrders,
  fetchOrder,
  fetchSoldOrders,
  placeOrder,
  retryPayment,
  updateItemStatus,
  verifyPayment,
} from './api'
import type { ItemStatus, Order, OrderStatus } from './types'

export const orderKeys = {
  all: ['orders'] as const,
  mine: (page: number) => ['orders', 'mine', page] as const,
  detail: (id: Id) => ['orders', 'detail', id] as const,
  sold: (page: number, status: string) => ['orders', 'sold', page, status] as const,
}

export function useMyOrders(page: number) {
  return useQuery({ queryKey: orderKeys.mine(page), queryFn: () => fetchMyOrders(page), placeholderData: keepPreviousData })
}

export function useOrder(id: Id) {
  return useQuery({ queryKey: orderKeys.detail(id), queryFn: () => fetchOrder(id) })
}

export function useSoldOrders(page: number, status: OrderStatus | '') {
  return useQuery({ queryKey: orderKeys.sold(page, status), queryFn: () => fetchSoldOrders({ page, status }), placeholderData: keepPreviousData })
}

// Orders change stock and the cart, so all of these are refreshed afterwards.
function useRefreshAfterOrder() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      [orderKeys.all, cartKeys.all, ['checkout'], productKeys.all].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    )
}

/** A failure after the order was created: the page can take the customer to it. */
export class OrderPaymentError extends Error {
  readonly orderId: Id
  constructor(message: string, orderId: Id) {
    super(message)
    this.orderId = orderId
  }
}

export type PaymentOutcome = { order: Order; outcome: 'paid' | 'dismissed' }

/**
 * Pays for a new order (from the cart, to an address) or an existing unpaid
 * one: gets Razorpay options from the server, opens Razorpay's window, and
 * sends the result back to be verified. Resolves with the outcome; if the
 * order was created but paying failed, rejects with OrderPaymentError.
 */
export function usePayOrder() {
  const refresh = useRefreshAfterOrder()
  return useMutation({
    mutationFn: async (input: { addressId: Id } | { orderId: Id }): Promise<PaymentOutcome> => {
      const { order, payment } = 'addressId' in input ? await placeOrder(input.addressId) : await retryPayment(input.orderId)
      try {
        const result = await openRazorpayCheckout(payment)
        return { order: await verifyPayment(order._id, result), outcome: 'paid' }
      } catch (error) {
        if (error instanceof PaymentDismissedError) return { order, outcome: 'dismissed' }
        throw new OrderPaymentError(error instanceof Error && !('isAxiosError' in error) ? error.message : errorMessage(error), order._id)
      }
    },
    onSettled: refresh,
  })
}

export function useCancelOrder() {
  const refresh = useRefreshAfterOrder()
  return useMutation({ mutationFn: cancelOrder, onSettled: refresh })
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, productId, status }: { orderId: Id; productId: Id; status: Exclude<ItemStatus, 'processing'> }) =>
      updateItemStatus(orderId, productId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  })
}
