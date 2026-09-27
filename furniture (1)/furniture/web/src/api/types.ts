// Shapes of the API's JSON responses (/api/v1). Money is always in paise.

export type Id = string

export type RoleName = 'Admin' | 'Vendor' | 'Customer'

export interface Role {
  _id: Id
  name: RoleName
}

export interface User {
  _id: Id
  name: string
  email: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  contactNum?: string
  role: Role | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: Id
  categoryName: string
  isActive: boolean
}

export interface Brand {
  _id: Id
  brandName: string
  categoryId?: Category | Id | null
}

export interface ProductImage {
  name?: string
  size?: number
  url: string
  type?: string
}

export interface Product {
  _id: Id
  productName: string
  description?: string
  /** Price in paise (₹1 = 100). */
  price: number
  categoryId: Category | null
  brandId: Brand | null
  user?: Id
  file?: ProductImage
  createdAt: string
  updatedAt: string
}

/** Every successful response: { message, data }. */
export interface ApiResponse<T> {
  message: string
  data: T
}

/** Every error response: { message, errors? } (errors maps field to text). */
export interface ApiErrorBody {
  message: string
  errors?: Record<string, string>
}
