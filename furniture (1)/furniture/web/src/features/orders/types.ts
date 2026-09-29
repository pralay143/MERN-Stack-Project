import type { Address, Id, PageMeta } from '@/api/types'

export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type ItemStatus = 'processing' | 'shipped' | 'delivered'

/** A bought product, as it was when ordered. Money in paise. */
export interface OrderItem {
  product: Id
  seller?: Id
  productName: string
  imageUrl?: string
  unitPrice: number
  quantity: number
  lineTotal: number
  status: ItemStatus
  shippedAt?: string
  deliveredAt?: string
}

export interface Order {
  _id: Id
  orderNumber: string
  /** The buyer's id; populated with name/email in the admin list. */
  user: Id | { _id: Id; name: string; email: string }
  items: OrderItem[]
  /** Not sent to sellers (they get sellerTotal instead). */
  subtotal?: number
  deliveryFee?: number
  total?: number
  sellerTotal?: number
  address: Omit<Address, '_id' | 'isDefault'>
  status: OrderStatus
  statusHistory: Array<{ status: OrderStatus; at: string; note?: string }>
  payment?: { razorpayOrderId?: string; razorpayPaymentId?: string; paidAt?: string }
  cancelledAt?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

/** What Razorpay Checkout needs, from POST /orders or /orders/:id/pay. */
export interface PaymentOptions {
  keyId: string
  razorpayOrderId: string
  amount: number
  currency: 'INR'
  name: string
  description: string
  prefill: { name?: string; email?: string; contact?: string }
}

/** Razorpay Checkout's success response, sent to /orders/:id/verify. */
export interface RazorpayResult {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface OrderPage {
  data: Order[]
  meta: PageMeta
}
