import { cn } from '@/lib/cn'
import { orderStatusLabel } from './status'
import type { ItemStatus, OrderStatus } from './types'

const TONES: Record<OrderStatus, string> = {
  pending_payment: 'bg-terracotta/15 text-terracotta',
  processing: 'bg-walnut-light text-walnut-dark',
  shipped: 'bg-walnut-light text-walnut-dark',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-sand text-muted',
}

export function OrderStatusBadge({ status }: { status: OrderStatus | ItemStatus }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', TONES[status])}>{orderStatusLabel(status)}</span>
}
