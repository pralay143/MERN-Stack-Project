import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Id } from '@/api/types'
import { createAddress, deleteAddress, fetchAddresses, updateAddress, type AddressInput } from './api'

export const addressKeys = { all: ['addresses'] as const }

export function useAddresses() {
  return useQuery({ queryKey: addressKeys.all, queryFn: fetchAddresses })
}

// Any change can move the default, and checkout totals depend on the
// address, so both are refetched.
function useRefresh() {
  const queryClient = useQueryClient()
  return () => Promise.all([queryClient.invalidateQueries({ queryKey: addressKeys.all }), queryClient.invalidateQueries({ queryKey: ['checkout'] })])
}

export function useCreateAddress() {
  const refresh = useRefresh()
  return useMutation({ mutationFn: createAddress, onSuccess: refresh })
}

export function useUpdateAddress() {
  const refresh = useRefresh()
  return useMutation({ mutationFn: ({ id, ...input }: Partial<AddressInput> & { id: Id }) => updateAddress(id, input), onSuccess: refresh })
}

export function useDeleteAddress() {
  const refresh = useRefresh()
  return useMutation({ mutationFn: deleteAddress, onSuccess: refresh })
}
