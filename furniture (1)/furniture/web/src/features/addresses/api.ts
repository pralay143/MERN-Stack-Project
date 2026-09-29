import { api } from '@/api/client'
import type { Address, ApiResponse, Id } from '@/api/types'

/** Address fields as the API takes them. */
export type AddressInput = Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean }

export async function fetchAddresses(): Promise<Address[]> {
  const { data } = await api.get<ApiResponse<Address[]>>('/addresses')
  return data.data
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const { data } = await api.post<ApiResponse<Address>>('/addresses', input)
  return data.data
}

export async function updateAddress(id: Id, input: Partial<AddressInput>): Promise<Address> {
  const { data } = await api.patch<ApiResponse<Address>>(`/addresses/${id}`, input)
  return data.data
}

export async function deleteAddress(id: Id): Promise<void> {
  await api.delete(`/addresses/${id}`)
}
