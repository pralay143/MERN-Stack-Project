import { api } from '@/api/client'
import type { ApiResponse, Brand, Category, Id, Product, Role, User } from '@/api/types'

// Writes for the seller and admin dashboards. The API checks every role and
// ownership rule; the dashboard only hides what an account can't use.

/** Product fields as the API takes them. Price is in paise. */
export interface ProductInput {
  productName: string
  description: string
  price: number
  categoryId: Id
  brandId?: Id
  /** Required when creating; when editing, only sent to replace the image. */
  image?: File
}

// The image goes as multipart "file"; the other fields as form fields.
function productForm(input: Partial<ProductInput>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === '') continue
    if (key === 'image') form.append('file', value as File)
    else form.append(key, String(value))
  }
  return form
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<ApiResponse<Product>>('/products', productForm(input))
  return data.data
}

export async function updateProduct(id: Id, input: Partial<ProductInput>): Promise<Product> {
  const { data } = await api.patch<ApiResponse<Product>>(`/products/${id}`, productForm(input))
  return data.data
}

export async function deleteProduct(id: Id): Promise<void> {
  await api.delete(`/products/${id}`)
}

export async function createCategory(input: { categoryName: string }): Promise<Category> {
  const { data } = await api.post<ApiResponse<Category>>('/categories', input)
  return data.data
}

export async function updateCategory(id: Id, input: Partial<Pick<Category, 'categoryName' | 'isActive'>>): Promise<Category> {
  const { data } = await api.patch<ApiResponse<Category>>(`/categories/${id}`, input)
  return data.data
}

export async function deleteCategory(id: Id): Promise<void> {
  await api.delete(`/categories/${id}`)
}

export async function createBrand(input: { brandName: string; categoryId?: Id }): Promise<Brand> {
  const { data } = await api.post<ApiResponse<Brand>>('/brands', input)
  return data.data
}

export async function updateBrand(id: Id, input: { brandName?: string; categoryId?: Id }): Promise<Brand> {
  const { data } = await api.patch<ApiResponse<Brand>>(`/brands/${id}`, input)
  return data.data
}

export async function deleteBrand(id: Id): Promise<void> {
  await api.delete(`/brands/${id}`)
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<ApiResponse<User[]>>('/users')
  return data.data
}

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await api.get<ApiResponse<Role[]>>('/roles')
  return data.data
}

export async function updateUserRole(id: Id, role: Id): Promise<User> {
  const { data } = await api.patch<ApiResponse<User>>(`/users/${id}`, { role })
  return data.data
}

export async function deleteUser(id: Id): Promise<void> {
  await api.delete(`/users/${id}`)
}
