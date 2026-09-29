import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { User } from '@/api/types'
import { renderRoute } from '@/test/render'
import * as authApi from '@/features/auth/api'
import * as ordersApi from '@/features/orders/api'
import type { Order } from '@/features/orders/types'
import { SoldOrdersPage } from './SoldOrdersPage'

vi.mock('@/features/auth/api')
vi.mock('@/features/orders/api')
const auth = vi.mocked(authApi)
const orders = vi.mocked(ordersApi)

const user = (role: 'Vendor' | 'Admin'): User => ({
  _id: role === 'Admin' ? 'admin1' : 'seller1',
  name: role,
  email: `${role.toLowerCase()}@example.com`,
  role: { _id: 'r', name: role },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

const address = { fullName: 'Asha Patel', phone: '9811122233', line1: '7 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' }

function order(overrides: Partial<Order> = {}): Order {
  return {
    _id: 'o1',
    orderNumber: 'EF-260930-ABCDEF',
    user: 'u1',
    items: [
      { product: 'p1', seller: 'seller1', productName: 'Grey Sofa', unitPrice: 3850000, quantity: 1, lineTotal: 3850000, status: 'processing' },
    ],
    sellerTotal: 3850000,
    address,
    status: 'processing',
    statusHistory: [],
    createdAt: '2026-09-30T10:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
    ...overrides,
  }
}
const page = (data: Order[]) => ({ data, meta: { page: 1, limit: 20, total: data.length, pages: 1 } })

beforeEach(() => {
  vi.resetAllMocks()
})

const renderPage = (at = '/dashboard/orders') => renderRoute(<SoldOrdersPage />, { path: '/dashboard/orders', at })

describe('as a seller', () => {
  beforeEach(() => {
    auth.fetchCurrentUser.mockResolvedValue(user('Vendor'))
  })

  test('shows paid orders with the delivery address and lets them ship an item', async () => {
    orders.fetchSoldOrders.mockResolvedValue(page([order()]))
    orders.updateItemStatus.mockResolvedValue(order())
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Your orders to fulfil' })).toBeInTheDocument()
    expect(await screen.findByText(/Deliver to Asha Patel, 7 MG Road, Bengaluru, Karnataka 560001/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Mark Grey Sofa shipped' }))
    expect(orders.updateItemStatus).toHaveBeenCalledWith('o1', 'p1', 'shipped')
  })

  test('shipped items can be marked delivered; delivered ones have no action', async () => {
    orders.fetchSoldOrders.mockResolvedValue(
      page([
        order({ status: 'shipped', items: [{ ...order().items[0], status: 'shipped' }] }),
        order({ _id: 'o2', orderNumber: 'EF-2', status: 'delivered', items: [{ ...order().items[0], status: 'delivered' }] }),
      ]),
    )
    renderPage()
    expect(await screen.findAllByRole('button', { name: /Mark Grey Sofa/ })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Mark Grey Sofa delivered' })).toBeInTheDocument()
  })

  test('sellers can’t cancel orders and can’t filter by unpaid', async () => {
    orders.fetchSoldOrders.mockResolvedValue(page([order()]))
    renderPage()
    await screen.findByText('Order EF-260930-ABCDEF')
    expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument()
    expect(within(screen.getByLabelText('Status')).queryByText('Payment pending')).not.toBeInTheDocument()
  })

  test('the status filter goes to the API', async () => {
    orders.fetchSoldOrders.mockResolvedValue(page([]))
    renderPage()
    await userEvent.selectOptions(await screen.findByLabelText('Status'), 'shipped')
    await waitFor(() => expect(orders.fetchSoldOrders).toHaveBeenLastCalledWith({ page: 1, status: 'shipped' }))
    expect(await screen.findByText('No shipped orders')).toBeInTheDocument()
  })
})

describe('as an admin', () => {
  beforeEach(() => {
    auth.fetchCurrentUser.mockResolvedValue(user('Admin'))
  })

  test('sees the customer and can cancel a paid order that hasn’t shipped, after confirming', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    orders.fetchSoldOrders.mockResolvedValue(page([order({ user: { _id: 'u1', name: 'Asha', email: 'asha@example.com' }, total: 3850000 })]))
    orders.cancelOrder.mockResolvedValue(order({ status: 'cancelled' }))
    renderPage()

    expect(await screen.findByRole('heading', { name: 'All orders' })).toBeInTheDocument()
    expect(await screen.findByText(/Asha \(asha@example.com\)/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel order' }))
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/Refund ₹38,500 to the customer from the Razorpay dashboard/))
    expect(orders.cancelOrder).toHaveBeenCalledWith('o1', expect.anything())
  })

  test('orders with a shipped item can’t be cancelled here', async () => {
    orders.fetchSoldOrders.mockResolvedValue(page([order({ items: [{ ...order().items[0], status: 'shipped' }], status: 'shipped' })]))
    renderPage()
    await screen.findByText('Order EF-260930-ABCDEF')
    expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument()
  })
})
