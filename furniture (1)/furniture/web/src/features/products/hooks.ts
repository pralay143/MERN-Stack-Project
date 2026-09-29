import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchBrands, fetchCategories, fetchProduct, fetchProducts, type ProductQuery } from './api'

export const productKeys = {
  all: ['products'] as const,
  list: (filters: ProductQuery) => ['products', 'list', filters] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
}

/**
 * One page of products for the parsed URL filters. The previous page stays on
 * screen while the next one loads (isPlaceholderData), so the grid never
 * flashes empty when paging or re-sorting.
 */
export function useProducts(filters: ProductQuery) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string) {
  return useQuery({ queryKey: productKeys.detail(id), queryFn: () => fetchProduct(id) })
}

// Categories and brands rarely change; keep them for the whole visit.
export const categoryKeys = { all: ['categories'] as const }
export const brandKeys = { all: ['brands'] as const }

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.all, queryFn: fetchCategories, staleTime: Infinity })
}

export function useBrands() {
  return useQuery({ queryKey: brandKeys.all, queryFn: fetchBrands, staleTime: Infinity })
}
