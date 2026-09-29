import { api } from '@/api/client'
import type { Address, ApiResponse, Id } from '@/api/types'
import type { CartLine } from '@/features/cart/types'

/** GET /checkout/summary: worked out by the API from the cart and address. */
export interface CheckoutSummary {
  items: CartLine[]
  itemCount: number
  subtotal: number
  deliveryFee: number
  total: number
  freeDeliveryFrom: number
  amountForFreeDelivery: number
  /** The chosen address, or the default one (null if none saved). */
  address: Address | null
  canPlaceOrder: boolean
  /** Plain-language reasons the order can't be placed yet. */
  blockers: string[]
}

export async function fetchCheckoutSummary(addressId?: Id): Promise<CheckoutSummary> {
  const { data } = await api.get<ApiResponse<CheckoutSummary>>('/checkout/summary', { params: addressId ? { addressId } : {} })
  return data.data
}
