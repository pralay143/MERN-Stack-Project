import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchBrands, fetchCategories, fetchProducts } from './api'
import type { ShopFilters } from './filters'

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ShopFilters) => ['products', 'list', filters] as const,
}

/**
 * One page of products for the parsed URL filters. The previous page stays on
 * screen while the next one loads (isPlaceholderData), so the grid never
 * flashes empty when paging or re-sorting.
 */
export function useProducts(filters: ShopFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  })
}

// Categories and brands rarely change; keep them for the whole visit.
export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: Infinity })
}

export function useBrands() {
  return useQuery({ queryKey: ['brands'], queryFn: fetchBrands, staleTime: Infinity })
}
