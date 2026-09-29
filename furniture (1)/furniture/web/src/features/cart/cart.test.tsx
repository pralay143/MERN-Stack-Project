import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Product, User } from '@/api/types'
import { CartPage } from '@/pages/CartPage'
import { renderRoute } from '@/test/render'
import * as authApi from '@/features/auth/api'
import * as productsApi from '@/features/products/api'
import { AddToCart } from './AddToCart'
import * as cartApi from './api'
import { CartLink } from './CartLink'
import { CartSync } from './CartSync'
import { readGuestCart, setGuestQuantity, writeGuestCart } from './guestCart'
import { buildCart } from './hooks'

vi.mock('@/features/auth/api')
vi.mock('./api')
vi.mock('@/features/products/api', async (importOriginal) => ({
  ...(await importOriginal<typeof productsApi>()),
  fetchProduct: vi.fn(),
}))
const auth = vi.mocked(authApi)
const api = vi.mocked(cartApi)
const products = vi.mocked(productsApi)

function product(id: string, name: string, price: number, stock: number): Product {
  return {
    _id: id,
    productName: name,
    price,
    stock,
    categoryId: null,
    brandId: null,
    file: { url: `/uploads/${id}.jpg` },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

const sofa = product('p1', 'Grey Sofa', 3850000, 5)
const lamp = product('p2', 'Floor Lamp', 250000, 2)
const catalogue: Record<string, Product> = { p1: sofa, p2: lamp }

const asha: User = {
  _id: 'u1',
  name: 'Asha',
  email: 'asha@example.com',
  role: { _id: 'r1', name: 'Customer' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
  writeGuestCart([])
  auth.fetchCurrentUser.mockResolvedValue(null)
  products.fetchProduct.mockImplementation(async (id) => catalogue[id])
})

describe('browser cart storage', () => {
  test('keeps product ids and quantities', () => {
    setGuestQuantity('p1', 2)
    setGuestQuantity('p2', 1)
    setGuestQuantity('p1', 3)
    expect(readGuestCart()).toEqual([
      { productId: 'p1', quantity: 3 },
      { productId: 'p2', quantity: 1 },
    ])
    expect(JSON.parse(localStorage.getItem('efurniture.cart')!)).toHaveLength(2)
  })

  test('ignores junk in storage', () => {
    localStorage.setItem('efurniture.cart', '{"not":"a list"}')
    window.dispatchEvent(new StorageEvent('storage', { key: 'efurniture.cart' }))
    // A fresh read after the storage event:
    writeGuestCart(readGuestCart())
    expect(readGuestCart()).toEqual([])
  })
})

test('buildCart totals lines and flags stock problems like the API', () => {
  const cart = buildCart([
    { product: sofa, quantity: 2 },
    { product: lamp, quantity: 3 },
    { product: { ...lamp, _id: 'p3', stock: 0 }, quantity: 1 },
  ])
  expect(cart.items.map((i) => i.problem)).toEqual([null, 'not_enough_stock', 'out_of_stock'])
  expect(cart.itemCount).toBe(6)
  expect(cart.subtotal).toBe(3850000 * 2 + 250000 * 4)
  expect(cart.hasProblems).toBe(true)
})

describe('as a visitor', () => {
  test('adding to the cart stores it in the browser and updates the header count', async () => {
    renderRoute(
      <>
        <CartLink />
        <AddToCart product={sofa} />
      </>,
    )
    await userEvent.selectOptions(await screen.findByLabelText('Quantity of Grey Sofa'), '2')
    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }))

    expect(await screen.findByRole('link', { name: 'Cart, 2 items' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('2 in your cart')
    expect(readGuestCart()).toEqual([{ productId: 'p1', quantity: 2 }])
    expect(api.setCartQuantity).not.toHaveBeenCalled()
  })

  test('only offers what is left once the cart holds the most you can buy', async () => {
    setGuestQuantity('p2', 2) // all the stock
    renderRoute(<AddToCart product={lamp} />)
    expect(await screen.findByRole('button', { name: 'Most you can buy is in your cart' })).toBeDisabled()
  })

  test('sold-out products can’t be added', async () => {
    renderRoute(<AddToCart product={{ ...sofa, stock: 0 }} />)
    expect(await screen.findByRole('button', { name: 'Sold out' })).toBeDisabled()
  })

  test('the cart page shows fresh product details and the delivery fee', async () => {
    setGuestQuantity('p2', 1)
    renderRoute(<CartPage />, { path: '/cart' })
    const items = await screen.findByRole('region', { name: 'Items' })
    expect(within(items).getByRole('link', { name: 'Floor Lamp' })).toBeInTheDocument()
    const summary = screen.getByRole('complementary', { name: 'Order summary' })
    expect(within(summary).getByText('₹499')).toBeInTheDocument()
    expect(within(summary).getByText('₹2,999')).toBeInTheDocument()
    expect(screen.getByText(/more for free delivery/)).toHaveTextContent('Add ₹17,500 more for free delivery.')
  })

  test('products that no longer exist drop out of the browser cart', async () => {
    const { AxiosError, AxiosHeaders } = await import('axios')
    const config = { headers: new AxiosHeaders() }
    products.fetchProduct.mockImplementation(async (id) => {
      if (id === 'gone') throw new AxiosError('x', 'ERR', config, {}, { status: 404, statusText: '', headers: {}, config, data: {} })
      return catalogue[id]
    })
    setGuestQuantity('p1', 1)
    setGuestQuantity('gone', 1)
    renderRoute(<CartPage />, { path: '/cart' })
    expect(await screen.findByRole('link', { name: 'Grey Sofa' })).toBeInTheDocument()
    await waitFor(() => expect(readGuestCart()).toEqual([{ productId: 'p1', quantity: 1 }]))
  })
})

describe('logged in', () => {
  beforeEach(() => {
    auth.fetchCurrentUser.mockResolvedValue(asha)
    api.fetchCart.mockResolvedValue(buildCart([{ product: sofa, quantity: 1 }]))
  })

  test('shows the account’s cart with free delivery above the threshold', async () => {
    renderRoute(<CartPage />, { path: '/cart' })
    expect(await screen.findByRole('link', { name: 'Grey Sofa' })).toBeInTheDocument()
    const summary = screen.getByRole('complementary', { name: 'Order summary' })
    expect(within(summary).getByText('Free')).toBeInTheDocument()
    expect(within(summary).getByRole('link', { name: 'Checkout' })).toHaveAttribute('href', '/checkout')
  })

  test('changing the quantity and removing go to the API', async () => {
    api.setCartQuantity.mockResolvedValue(buildCart([{ product: sofa, quantity: 3 }]))
    api.removeCartItem.mockResolvedValue(buildCart([]))
    renderRoute(<CartPage />, { path: '/cart' })

    await userEvent.selectOptions(await screen.findByLabelText('Quantity of Grey Sofa'), '3')
    expect(api.setCartQuantity).toHaveBeenCalledWith('p1', 3)
    const summary = screen.getByRole('complementary', { name: 'Order summary' })
    await waitFor(() => expect(within(summary).getByText('Total').nextElementSibling).toHaveTextContent('₹1,15,500'))

    await userEvent.click(screen.getByRole('button', { name: 'Remove Grey Sofa' }))
    expect(api.removeCartItem).toHaveBeenCalledWith('p1')
    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument()
  })

  test('stock problems are explained and block checkout', async () => {
    api.fetchCart.mockResolvedValue(buildCart([{ product: { ...lamp, stock: 1 }, quantity: 2 }]))
    renderRoute(<CartPage />, { path: '/cart' })
    expect(await screen.findByText('Only 1 left: lower the quantity')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled()
  })

  test('the server’s message is shown when an update is refused', async () => {
    const { AxiosError, AxiosHeaders } = await import('axios')
    const config = { headers: new AxiosHeaders() }
    api.setCartQuantity.mockRejectedValue(
      new AxiosError('x', 'ERR', config, {}, { status: 409, statusText: '', headers: {}, config, data: { message: 'Only 2 left of Grey Sofa' } }),
    )
    renderRoute(<CartPage />, { path: '/cart' })
    await userEvent.selectOptions(await screen.findByLabelText('Quantity of Grey Sofa'), '3')
    expect(await screen.findByRole('alert')).toHaveTextContent('Only 2 left of Grey Sofa')
  })
})

test('logging in moves the browser cart into the account once', async () => {
  setGuestQuantity('p1', 2)
  auth.fetchCurrentUser.mockResolvedValue(asha)
  api.mergeCart.mockResolvedValue(buildCart([{ product: sofa, quantity: 2 }]))
  api.fetchCart.mockResolvedValue(buildCart([]))

  renderRoute(
    <>
      <CartSync />
      <CartLink />
    </>,
  )
  expect(await screen.findByRole('link', { name: 'Cart, 2 items' })).toBeInTheDocument()
  expect(api.mergeCart).toHaveBeenCalledTimes(1)
  expect(api.mergeCart).toHaveBeenCalledWith([{ productId: 'p1', quantity: 2 }])
  expect(readGuestCart()).toEqual([])
})
