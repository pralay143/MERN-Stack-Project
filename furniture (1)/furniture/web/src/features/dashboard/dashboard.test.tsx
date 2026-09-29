import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import type { Product, User } from '@/api/types'
import * as authApi from '@/features/auth/api'
import * as productsApi from '@/features/products/api'
import { renderRoute } from '@/test/render'
import * as dashboardApi from './api'
import { CategoriesPage } from './CategoriesPage'
import { DashboardLayout } from './DashboardLayout'
import { EditProductPage, NewProductPage } from './ProductFormPage'
import { ProductsPage } from './ProductsPage'
import { UsersPage } from './UsersPage'

vi.mock('@/features/auth/api')
vi.mock('./api')
vi.mock('@/features/products/api', async (importOriginal) => ({
  ...(await importOriginal<typeof productsApi>()),
  fetchProducts: vi.fn(),
  fetchProduct: vi.fn(),
  fetchCategories: vi.fn(),
  fetchBrands: vi.fn(),
}))
const auth = vi.mocked(authApi)
const products = vi.mocked(productsApi)
const dashboard = vi.mocked(dashboardApi)

const person = (id: string, role: 'Admin' | 'Vendor' | 'Customer'): User => ({
  _id: id,
  name: `${role} ${id}`,
  email: `${id}@example.com`,
  role: { _id: `r-${role}`, name: role },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})
const vendor = person('v1', 'Vendor')
const admin = person('a1', 'Admin')

const chairs = { _id: '66f1a2b3c4d5e6f7a8b9c0d1', categoryName: 'Chairs', isActive: true }
const product: Product = {
  _id: 'p1',
  productName: 'Wicker Pod Chair',
  description: 'Hand-woven.',
  price: 2650000,
  categoryId: chairs,
  brandId: null,
  user: vendor._id,
  file: { url: '/uploads/pod.jpg' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function httpError(status: number, data: unknown = { message: 'Request failed' }) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('fail', 'ERR', config, {}, { status, statusText: '', headers: {}, config, data })
}

beforeAll(() => {
  // jsdom has no object URLs (used for the image preview).
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

beforeEach(() => {
  vi.resetAllMocks()
  auth.fetchCurrentUser.mockResolvedValue(vendor)
  products.fetchProducts.mockResolvedValue({ message: '', data: [product], meta: { page: 1, limit: 12, total: 1, pages: 1 } })
  products.fetchProduct.mockResolvedValue(product)
  products.fetchCategories.mockResolvedValue([chairs, { _id: 'hidden', categoryName: 'Retired', isActive: false }])
  products.fetchBrands.mockResolvedValue([])
})

describe('access', () => {
  test('customers are turned away and sellers only see Products', async () => {
    auth.fetchCurrentUser.mockResolvedValue(person('c1', 'Customer'))
    renderRoute(<DashboardLayout />, { path: '/dashboard' })
    expect(await screen.findByText('This page isn’t available to your account')).toBeInTheDocument()
  })

  test('a seller sees only the Products section', async () => {
    renderRoute(<DashboardLayout />, { path: '/dashboard' })
    const nav = await screen.findByRole('navigation', { name: 'Dashboard' })
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Products'])
  })

  test('an admin sees every section', async () => {
    auth.fetchCurrentUser.mockResolvedValue(admin)
    renderRoute(<DashboardLayout />, { path: '/dashboard' })
    const nav = await screen.findByRole('navigation', { name: 'Dashboard' })
    expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Products', 'Categories', 'Brands', 'Users'])
  })
})

describe('products list', () => {
  test('a seller lists only their own products', async () => {
    renderRoute(<ProductsPage />, { path: '/dashboard/products' })
    expect(await screen.findByRole('link', { name: 'Wicker Pod Chair' })).toBeInTheDocument()
    expect(screen.getByText('₹26,500')).toBeInTheDocument()
    expect(products.fetchProducts).toHaveBeenCalledWith(expect.objectContaining({ seller: vendor._id }))
  })

  test('an admin lists every product', async () => {
    auth.fetchCurrentUser.mockResolvedValue(admin)
    renderRoute(<ProductsPage />, { path: '/dashboard/products' })
    await screen.findByRole('link', { name: 'Wicker Pod Chair' })
    expect(products.fetchProducts).toHaveBeenCalledWith(expect.objectContaining({ seller: undefined }))
  })

  test('deleting asks first', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    dashboard.deleteProduct.mockResolvedValue()
    renderRoute(<ProductsPage />, { path: '/dashboard/products' })
    const del = await screen.findByRole('button', { name: 'Delete Wicker Pod Chair' })

    await userEvent.click(del)
    expect(dashboard.deleteProduct).not.toHaveBeenCalled()
    await userEvent.click(del)
    await waitFor(() => expect(dashboard.deleteProduct).toHaveBeenCalledWith('p1', expect.anything()))
    expect(confirm).toHaveBeenCalledTimes(2)
  })
})

describe('product form', () => {
  const routes = [{ path: '/dashboard/products', element: <p>Back on the list</p> }]

  test('checks the form before sending it', async () => {
    renderRoute(<NewProductPage />, { path: '/dashboard/products/new', routes })
    await userEvent.click(await screen.findByRole('button', { name: 'Add product' }))
    expect(await screen.findByText('Enter a product name')).toBeInTheDocument()
    expect(screen.getByText('Enter a price')).toBeInTheDocument()
    expect(screen.getByText('Choose a category')).toBeInTheDocument()
    expect(screen.getByText('Add a photo of the product')).toBeInTheDocument()
    expect(dashboard.createProduct).not.toHaveBeenCalled()
  })

  test('adds a product with the price in paise and the photo', async () => {
    dashboard.createProduct.mockResolvedValue(product)
    renderRoute(<NewProductPage />, { path: '/dashboard/products/new', routes })
    const photo = new File(['png'], 'chair.png', { type: 'image/png' })

    await userEvent.type(screen.getByLabelText('Name'), 'Rattan Chair')
    await userEvent.type(screen.getByLabelText('Price (₹)'), '12,499.50')
    const category = screen.getByLabelText('Category')
    await waitFor(() => expect(category).toBeEnabled())
    // Hidden categories aren't offered for new products.
    expect(within(category).queryByText('Retired')).not.toBeInTheDocument()
    await userEvent.selectOptions(category, 'Chairs')
    await userEvent.upload(screen.getByLabelText('Photo'), photo)
    expect(screen.getByRole('img', { name: 'Selected product photo' })).toHaveAttribute('src', 'blob:preview')
    await userEvent.click(screen.getByRole('button', { name: 'Add product' }))

    expect(await screen.findByText('Back on the list')).toBeInTheDocument()
    expect(dashboard.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ productName: 'Rattan Chair', price: 1249950, categoryId: chairs._id, brandId: undefined, image: photo }),
      expect.anything(),
    )
  })

  test('shows the server’s field messages', async () => {
    dashboard.createProduct.mockRejectedValue(httpError(400, { message: 'Validation failed', errors: { productName: 'Name is taken' } }))
    renderRoute(<NewProductPage />, { path: '/dashboard/products/new', routes })
    await userEvent.type(screen.getByLabelText('Name'), 'Chair')
    await userEvent.type(screen.getByLabelText('Price (₹)'), '100')
    await waitFor(() => expect(screen.getByLabelText('Category')).toBeEnabled())
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Chairs')
    await userEvent.upload(screen.getByLabelText('Photo'), new File(['png'], 'c.png', { type: 'image/png' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add product' }))
    expect(await screen.findByText('Name is taken')).toBeInTheDocument()
  })

  test('edits a product without re-uploading its photo', async () => {
    dashboard.updateProduct.mockResolvedValue(product)
    renderRoute(<EditProductPage />, { path: '/dashboard/products/:id/edit', at: '/dashboard/products/p1/edit', routes })
    const price = await screen.findByLabelText('Price (₹)')
    expect(price).toHaveValue('26500')
    expect(screen.getByLabelText('Name')).toHaveValue('Wicker Pod Chair')

    await userEvent.clear(price)
    await userEvent.type(price, '24999')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Back on the list')).toBeInTheDocument()
    expect(dashboard.updateProduct).toHaveBeenCalledWith('p1', expect.objectContaining({ price: 2499900, image: undefined }))
  })

  test('a seller can’t open someone else’s product', async () => {
    products.fetchProduct.mockResolvedValue({ ...product, user: 'someone-else' })
    renderRoute(<EditProductPage />, { path: '/dashboard/products/:id/edit', at: '/dashboard/products/p1/edit' })
    expect(await screen.findByText('You can only edit your own products.')).toBeInTheDocument()
  })
})

describe('categories', () => {
  beforeEach(() => auth.fetchCurrentUser.mockResolvedValue(admin))

  test('adds a category and explains a duplicate name', async () => {
    dashboard.createCategory.mockRejectedValueOnce(httpError(409)).mockResolvedValueOnce(chairs)
    renderRoute(<CategoriesPage />)
    const name = screen.getByLabelText('New category')

    await userEvent.type(name, 'Chairs')
    await userEvent.click(screen.getByRole('button', { name: 'Add category' }))
    expect(await screen.findByText('That name is already taken')).toBeInTheDocument()

    await userEvent.clear(name)
    await userEvent.type(name, 'Stools')
    await userEvent.click(screen.getByRole('button', { name: 'Add category' }))
    await waitFor(() => expect(name).toHaveValue(''))
    // TanStack Query passes the mutation context as a second argument.
    expect(dashboard.createCategory).toHaveBeenLastCalledWith({ categoryName: 'Stools' }, expect.anything())
  })

  test('hides a category and renames one', async () => {
    dashboard.updateCategory.mockResolvedValue(chairs)
    renderRoute(<CategoriesPage />)
    await userEvent.click(await screen.findByRole('button', { name: 'Hide Chairs' }))
    expect(dashboard.updateCategory).toHaveBeenCalledWith(chairs._id, { isActive: false })

    await userEvent.click(screen.getByRole('button', { name: 'Rename Chairs' }))
    const input = screen.getByLabelText('Category name')
    await userEvent.clear(input)
    await userEvent.type(input, 'Seating{Enter}')
    await waitFor(() => expect(dashboard.updateCategory).toHaveBeenLastCalledWith(chairs._id, { categoryName: 'Seating' }))
  })
})

describe('users', () => {
  test('changes another user’s role but not the admin’s own', async () => {
    auth.fetchCurrentUser.mockResolvedValue(admin)
    const shopper = person('c1', 'Customer')
    dashboard.fetchUsers.mockResolvedValue([admin, shopper])
    dashboard.fetchRoles.mockResolvedValue([admin.role!, vendor.role!, shopper.role!])
    dashboard.updateUserRole.mockResolvedValue(shopper)
    renderRoute(<UsersPage />)

    const own = await screen.findByLabelText(`Role for ${admin.name}`)
    expect(own).toBeDisabled()
    expect(screen.queryByRole('button', { name: `Delete ${admin.name}` })).not.toBeInTheDocument()

    const theirs = screen.getByLabelText(`Role for ${shopper.name}`)
    await waitFor(() => expect(theirs).toBeEnabled())
    await userEvent.selectOptions(theirs, 'r-Vendor')
    expect(dashboard.updateUserRole).toHaveBeenCalledWith('c1', 'r-Vendor')
  })
})
