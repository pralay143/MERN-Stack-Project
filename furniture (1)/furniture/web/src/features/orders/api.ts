import { api } from '@/api/client'
import type { ApiResponse, Id } from '@/api/types'
import type { ItemStatus, Order, OrderPage, OrderStatus, PaymentOptions, RazorpayResult } from './types'

type WithPayment = { order: Order; payment: PaymentOptions }

/** Places the cart as an order (stock is reserved) and gets Razorpay options. */
export async function placeOrder(addressId: Id): Promise<WithPayment> {
  const { data } = await api.post<ApiResponse<WithPayment>>('/orders', { addressId })
  return data.data
}

/** Razorpay options to pay an existing unpaid order. */
export async function retryPayment(orderId: Id): Promise<WithPayment> {
  const { data } = await api.post<ApiResponse<WithPayment>>(`/orders/${orderId}/pay`)
  return data.data
}

/** Sends Razorpay's response to the server, which checks its signature. */
export async function verifyPayment(orderId: Id, result: RazorpayResult): Promise<Order> {
  const { data } = await api.post<ApiResponse<Order>>(`/orders/${orderId}/verify`, result)
  return data.data
}

export async function cancelOrder(orderId: Id): Promise<Order> {
  const { data } = await api.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`)
  return data.data
}

export async function fetchMyOrders(page = 1): Promise<OrderPage> {
  const { data } = await api.get<OrderPage>('/orders', { params: { page, limit: 10 } })
  return data
}

export async function fetchOrder(orderId: Id): Promise<Order> {
  const { data } = await api.get<ApiResponse<Order>>(`/orders/${orderId}`)
  return data.data
}

/** Dashboard: a seller's paid orders, or every order for admins. */
export async function fetchSoldOrders({ page = 1, status }: { page?: number; status?: OrderStatus | '' }): Promise<OrderPage> {
  const { data } = await api.get<OrderPage>('/orders/sold', { params: { page, limit: 20, ...(status ? { status } : {}) } })
  return data
}

export async function updateItemStatus(orderId: Id, productId: Id, status: Exclude<ItemStatus, 'processing'>): Promise<Order> {
  const { data } = await api.patch<ApiResponse<Order>>(`/orders/${orderId}/items/${productId}`, { status })
  return data.data
}
