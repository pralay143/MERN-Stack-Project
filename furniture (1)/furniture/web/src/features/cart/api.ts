import { api } from '@/api/client'
import type { ApiResponse, Id } from '@/api/types'
import type { Cart, StoredCartItem } from './types'

// The logged-in user's cart (/api/v1/cart). Every call returns the whole
// updated cart.

export async function fetchCart(): Promise<Cart> {
  const { data } = await api.get<ApiResponse<Cart>>('/cart')
  return data.data
}

export async function setCartQuantity(productId: Id, quantity: number): Promise<Cart> {
  const { data } = await api.put<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity })
  return data.data
}

export async function removeCartItem(productId: Id): Promise<Cart> {
  const { data } = await api.delete<ApiResponse<Cart>>(`/cart/items/${productId}`)
  return data.data
}

export async function clearCart(): Promise<Cart> {
  const { data } = await api.delete<ApiResponse<Cart>>('/cart')
  return data.data
}

/** Adds a visitor's browser cart to their account after they log in. */
export async function mergeCart(items: StoredCartItem[]): Promise<Cart> {
  const { data } = await api.post<ApiResponse<Cart>>('/cart/merge', { items })
  return data.data
}
