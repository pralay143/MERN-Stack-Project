import { api } from '@/api/client'
import type { ApiResponse, Brand, Category, PagedResponse, Product } from '@/api/types'
import type { ShopFilters } from './filters'

/** Products shown per shop page; divides evenly into 1–4 grid columns. */
export const PAGE_SIZE = 12

/** Shop filters, optionally narrowed to one seller's products (the dashboard). */
export type ProductQuery = ShopFilters & { seller?: string }

/** One page of products. Empty filters are left out of the request. */
export async function fetchProducts(filters: ProductQuery): Promise<PagedResponse<Product>> {
  const params: Record<string, string | number> = { sort: filters.sort, page: filters.page, limit: PAGE_SIZE }
  if (filters.q) params.q = filters.q
  if (filters.category) params.category = filters.category
  if (filters.brand) params.brand = filters.brand
  if (filters.seller) params.seller = filters.seller
  const { data } = await api.get<PagedResponse<Product>>('/products', { params })
  return data
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`)
  return data.data
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<Category[]>>('/categories')
  return data.data
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data } = await api.get<ApiResponse<Brand[]>>('/brands')
  return data.data
}
