import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { PagedResponse, Product } from '@/api/types'
import { ShopPage } from '@/pages/ShopPage'
import { renderRoute } from '@/test/render'
import * as productsApi from './api'

vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof productsApi>()),
  fetchProducts: vi.fn(),
  fetchCategories: vi.fn(),
  fetchBrands: vi.fn(),
}))
const mocked = vi.mocked(productsApi)

const sofas = { _id: '66f1a2b3c4d5e6f7a8b9c0d1', categoryName: 'Sofas', isActive: true }

function product(n: number, price = 3299900): Product {
  return {
    _id: `p${n}`,
    productName: `Product ${n}`,
    price,
    stock: 8,
    categoryId: sofas,
    brandId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function page(items: Product[], { page = 1, total = items.length } = {}): PagedResponse<Product> {
  return { message: 'Products found', data: items, meta: { page, limit: 12, total, pages: Math.max(1, Math.ceil(total / 12)) } }
}

const renderShop = (at = '/shop') => renderRoute(<ShopPage />, { path: '/shop', at })
const search = (router: ReturnType<typeof renderShop>['router']) => new URLSearchParams(router.state.location.search)

beforeEach(() => {
  vi.resetAllMocks()
  mocked.fetchCategories.mockResolvedValue([sofas])
  mocked.fetchBrands.mockResolvedValue([])
})

describe('shop page', () => {
  test('shows skeletons, then products with prices and links', async () => {
    mocked.fetchProducts.mockResolvedValue(page([product(1, 3299900)]))
    renderShop()
    expect(screen.getByRole('status')).toHaveTextContent('Loading products')

    const link = await screen.findByRole('link', { name: /Product 1/ })
    expect(link).toHaveAttribute('href', '/products/p1')
    expect(within(link).getByText('₹32,999')).toBeInTheDocument()
    expect(screen.getByText('1 piece')).toBeInTheDocument()
  })

  test('numbers pages from the total and keeps the filters in page links', async () => {
    mocked.fetchProducts.mockResolvedValue(page([product(1)], { total: 30 }))
    renderShop('/shop?q=sofa')
    const pages = await screen.findByRole('navigation', { name: 'Pages' })
    expect(within(pages).getByRole('link', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(within(pages).getByRole('link', { name: 'Page 3' })).toHaveAttribute('href', '/shop?q=sofa&page=3')
  })

  test('keeps the current products on screen while the next page loads', async () => {
    mocked.fetchProducts.mockResolvedValueOnce(page([product(1)], { total: 30 }))
    mocked.fetchProducts.mockReturnValueOnce(new Promise(() => {}))
    renderShop()
    await userEvent.click(await screen.findByRole('link', { name: 'Page 2' }))

    await waitFor(() => expect(mocked.fetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })))
    expect(screen.getByRole('link', { name: /Product 1/ })).toBeInTheDocument()
    expect(screen.queryByText('Loading products…')).not.toBeInTheDocument()
  })

  test('searches once typing pauses and starts again at page 1', async () => {
    mocked.fetchProducts.mockResolvedValue(page([product(1)], { total: 30 }))
    const { router } = renderShop('/shop?page=2')
    await screen.findByRole('link', { name: /Product 1/ })

    await userEvent.type(screen.getByLabelText('Search'), 'teak bed')
    expect(search(router).get('q')).toBeNull()

    await waitFor(() => expect(search(router).get('q')).toBe('teak bed'))
    expect(search(router).has('page')).toBe(false)
    expect(mocked.fetchProducts).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'teak bed', page: 1 }))
    // One search for the whole phrase, not one per keystroke.
    expect(mocked.fetchProducts.mock.calls.filter(([f]) => f.q)).toHaveLength(1)
  })

  test('choosing a category resets the page', async () => {
    mocked.fetchProducts.mockResolvedValue(page([product(1)], { total: 30 }))
    const { router } = renderShop('/shop?page=3&sort=price_asc')
    const category = screen.getByLabelText('Category')
    await waitFor(() => expect(category).toBeEnabled())

    await userEvent.selectOptions(category, 'Sofas')
    expect(search(router).get('category')).toBe(sofas._id)
    expect(search(router).get('sort')).toBe('price_asc')
    expect(search(router).has('page')).toBe(false)
  })

  test('says when nothing matches and clears the filters', async () => {
    mocked.fetchProducts.mockResolvedValue(page([]))
    const { router } = renderShop(`/shop?q=unicorn&category=${sofas._id}&sort=name`)

    expect(await screen.findByText('No products match your filters')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(router.state.location.search).toBe('?sort=name')
    await waitFor(() => expect(screen.getByLabelText('Search')).toHaveValue(''))
  })

  test('shows an error with a retry', async () => {
    const config = { headers: new AxiosHeaders() }
    const serverError = new AxiosError('fail', 'ERR_BAD_RESPONSE', config, {}, {
      status: 500, statusText: '', headers: {}, config, data: { message: 'Something broke on our side' },
    })
    mocked.fetchProducts.mockRejectedValueOnce(serverError).mockResolvedValue(page([product(1)]))
    renderShop()

    expect(await screen.findByRole('alert')).toHaveTextContent('Something broke on our side')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('link', { name: /Product 1/ })).toBeInTheDocument()
  })
})
