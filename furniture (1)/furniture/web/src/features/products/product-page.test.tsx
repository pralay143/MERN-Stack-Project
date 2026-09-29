import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Product } from '@/api/types'
import { ProductPage } from '@/pages/ProductPage'
import { renderRoute } from '@/test/render'
import * as productsApi from './api'

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof productsApi>()),
  fetchProduct: vi.fn(),
  fetchProducts: vi.fn(),
}))
const mocked = vi.mocked(productsApi)

const beds = { _id: '66f1a2b3c4d5e6f7a8b9c0d1', categoryName: 'Beds', isActive: true }

function product(id: string, name: string): Product {
  return {
    _id: id,
    productName: name,
    description: 'Solid sheesham.',
    price: 5899900,
    categoryId: beds,
    brandId: { _id: 'b1', brandName: 'Oakwood & Co' },
    file: { url: '/uploads/bed.jpg' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function httpError(status: number) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('fail', 'ERR', config, {}, { status, statusText: '', headers: {}, config, data: { message: 'Server trouble' } })
}

const renderProduct = (id = 'p1') =>
  renderRoute(<ProductPage />, { path: '/products/:id', at: `/products/${id}` })

beforeEach(() => {
  vi.resetAllMocks()
  mocked.fetchProducts.mockResolvedValue({
    message: '',
    data: [product('p1', 'Espresso Sleigh Bed'), product('p2', 'Panelled King Bed')],
    meta: { page: 1, limit: 12, total: 2, pages: 1 },
  })
})

describe('product page', () => {
  test('shows the product with its price, then others from the category', async () => {
    mocked.fetchProduct.mockResolvedValue(product('p1', 'Espresso Sleigh Bed'))
    renderProduct()
    expect(screen.getByRole('status')).toHaveTextContent('Loading product')

    expect(await screen.findByRole('heading', { level: 1, name: 'Espresso Sleigh Bed' })).toBeInTheDocument()
    expect(screen.getByText('₹58,999')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Espresso Sleigh Bed' })).toHaveAttribute('src', '/uploads/bed.jpg')
    expect(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole('link', { name: 'Beds' })).toHaveAttribute(
      'href',
      `/shop?category=${beds._id}`,
    )

    const related = await screen.findByRole('region', { name: 'More beds' })
    expect(within(related).getByRole('link', { name: /Panelled King Bed/ })).toHaveAttribute('href', '/products/p2')
    // The product itself isn't suggested.
    expect(within(related).queryByText('Espresso Sleigh Bed')).not.toBeInTheDocument()
  })

  test.each([400, 404])('a %s shows the not-found page', async (status) => {
    mocked.fetchProduct.mockRejectedValue(httpError(status))
    renderProduct('nope')
    expect(await screen.findByRole('heading', { name: 'We can’t find that page' })).toBeInTheDocument()
  })

  test('a server error can be retried', async () => {
    mocked.fetchProduct.mockRejectedValueOnce(httpError(500)).mockResolvedValue(product('p1', 'Espresso Sleigh Bed'))
    renderProduct()
    expect(await screen.findByRole('alert')).toHaveTextContent('Server trouble')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Espresso Sleigh Bed' })).toBeInTheDocument()
  })
})
