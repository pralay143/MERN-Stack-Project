import type { ItemStatus, OrderStatus } from './types'

// What customers and sellers see for each status.
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Payment pending',
  processing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const orderStatusLabel = (status: OrderStatus | ItemStatus) => STATUS_LABELS[status]
