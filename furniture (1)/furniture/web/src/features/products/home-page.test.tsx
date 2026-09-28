import { screen, within } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import type { Product } from '@/api/types'
import { HomePage } from '@/pages/HomePage'
import { renderRoute } from '@/test/render'
import * as productsApi from './api'

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof productsApi>()),
  fetchProducts: vi.fn(),
  fetchCategories: vi.fn(),
}))
const mocked = vi.mocked(productsApi)

const product = (n: number): Product => ({
  _id: `p${n}`,
  productName: `Chair ${n}`,
  price: 899900,
  categoryId: null,
  brandId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

beforeEach(() => {
  vi.resetAllMocks()
  mocked.fetchProducts.mockResolvedValue({
    message: '',
    data: [1, 2, 3, 4, 5, 6].map(product),
    meta: { page: 1, limit: 12, total: 6, pages: 1 },
  })
  mocked.fetchCategories.mockResolvedValue([
    { _id: 'c1', categoryName: 'Sofas', isActive: true },
    { _id: 'c2', categoryName: 'Retired', isActive: false },
  ])
})

test('links to active categories and shows the four newest products', async () => {
  renderRoute(<HomePage />)
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()

  const categories = await screen.findByRole('region', { name: 'Shop by category' })
  expect(await within(categories).findByRole('link', { name: /Sofas/ })).toHaveAttribute('href', '/shop?category=c1')
  expect(within(categories).queryByText('Retired')).not.toBeInTheDocument()

  expect(await screen.findByRole('link', { name: /Chair 1/ })).toHaveAttribute('href', '/products/p1')
  expect(screen.getByRole('link', { name: /Chair 4/ })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /Chair 5/ })).not.toBeInTheDocument()
  expect(mocked.fetchProducts).toHaveBeenCalledWith(expect.objectContaining({ sort: 'newest', page: 1 }))
})
