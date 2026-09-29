import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { Id } from '@/api/types'
import { fetchCheckoutSummary } from './api'

export const checkoutKeys = {
  summary: (addressId?: Id) => ['checkout', 'summary', addressId ?? 'default'] as const,
}

/** The server's checkout summary for an address (the default when none given). */
export function useCheckoutSummary(addressId?: Id) {
  return useQuery({
    queryKey: checkoutKeys.summary(addressId),
    queryFn: () => fetchCheckoutSummary(addressId),
    placeholderData: keepPreviousData,
    // Prices and stock can change; always check again when opening checkout.
    staleTime: 0,
  })
}
