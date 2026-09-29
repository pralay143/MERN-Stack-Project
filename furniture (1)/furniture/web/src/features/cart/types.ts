import type { Id, Product } from '@/api/types'

/** The product details a cart line needs. */
export type CartProduct = Pick<Product, '_id' | 'productName' | 'price' | 'stock' | 'file'>

export type CartProblem = 'out_of_stock' | 'not_enough_stock' | null

export interface CartLine {
  product: CartProduct
  quantity: number
  /** price × quantity, in paise. */
  lineTotal: number
  /** Why this line can't be bought as it stands, if it can't. */
  problem: CartProblem
}

/** A cart as the API returns it (GET /cart); guest carts are shaped the same. */
export interface Cart {
  items: CartLine[]
  itemCount: number
  subtotal: number
  hasProblems: boolean
}

/** What a visitor's browser cart stores for each line. */
export interface StoredCartItem {
  productId: Id
  quantity: number
}
