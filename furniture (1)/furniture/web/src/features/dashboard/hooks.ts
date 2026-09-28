import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import type { Id } from '@/api/types'
import { brandKeys, categoryKeys, productKeys } from '@/features/products/hooks'
import * as dashboardApi from './api'

const userKeys = { all: ['users'] as const }

/** A mutation that refetches the given cached lists when it succeeds. */
function useInvalidatingMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>, keys: QueryKey[]) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  })
}

// Products show category and brand names, so category/brand changes refresh them too.
const PRODUCTS = [productKeys.all]
const CATEGORIES = [categoryKeys.all, productKeys.all]
const BRANDS = [brandKeys.all, productKeys.all]

export const useCreateProduct = () => useInvalidatingMutation(dashboardApi.createProduct, PRODUCTS)
export const useUpdateProduct = () =>
  useInvalidatingMutation(({ id, ...input }: Partial<dashboardApi.ProductInput> & { id: Id }) => dashboardApi.updateProduct(id, input), PRODUCTS)
export const useDeleteProduct = () => useInvalidatingMutation(dashboardApi.deleteProduct, PRODUCTS)

export const useCreateCategory = () => useInvalidatingMutation(dashboardApi.createCategory, CATEGORIES)
export const useUpdateCategory = () =>
  useInvalidatingMutation(
    ({ id, ...input }: { id: Id; categoryName?: string; isActive?: boolean }) => dashboardApi.updateCategory(id, input),
    CATEGORIES,
  )
export const useDeleteCategory = () => useInvalidatingMutation(dashboardApi.deleteCategory, CATEGORIES)

export const useCreateBrand = () => useInvalidatingMutation(dashboardApi.createBrand, BRANDS)
export const useUpdateBrand = () =>
  useInvalidatingMutation(({ id, ...input }: { id: Id; brandName?: string; categoryId?: Id }) => dashboardApi.updateBrand(id, input), BRANDS)
export const useDeleteBrand = () => useInvalidatingMutation(dashboardApi.deleteBrand, BRANDS)

export function useUsers() {
  return useQuery({ queryKey: userKeys.all, queryFn: dashboardApi.fetchUsers })
}

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: dashboardApi.fetchRoles, staleTime: Infinity })
}

export const useUpdateUserRole = () =>
  useInvalidatingMutation(({ id, role }: { id: Id; role: Id }) => dashboardApi.updateUserRole(id, role), [userKeys.all])
export const useDeleteUser = () => useInvalidatingMutation(dashboardApi.deleteUser, [userKeys.all])
