import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Address, User } from '@/api/types'
import * as razorpay from '@/lib/razorpay'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrderPage } from '@/pages/OrderPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { renderRoute } from '@/test/render'
import * as addressesApi from '@/features/addresses/api'
import * as authApi from '@/features/auth/api'
import { buildCart } from '@/features/cart/hooks'
import * as checkoutApi from '@/features/checkout/api'
import * as ordersApi from './api'
import type { Order, PaymentOptions } from './types'

vi.mock('@/features/auth/api')
vi.mock('@/features/addresses/api')
vi.mock('@/features/checkout/api')
vi.mock('./api')
vi.mock('@/lib/razorpay', async (importOriginal) => ({
  ...(await importOriginal<typeof razorpay>()),
  openRazorpayCheckout: vi.fn(),
}))
const auth = vi.mocked(authApi)
const addresses = vi.mocked(addressesApi)
const checkout = vi.mocked(checkoutApi)
const orders = vi.mocked(ordersApi)
const openCheckout = vi.mocked(razorpay.openRazorpayCheckout)

const asha: User = {
  _id: 'u1',
  name: 'Asha Patel',
  email: 'asha@example.com',
  role: { _id: 'r1', name: 'Customer' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}
const home: Address = { _id: 'a1', fullName: 'Asha Patel', phone: '9876543210', line1: '12 Shanti Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009', isDefault: true }
const sofa = { _id: 'p1', productName: 'Grey Sofa', price: 3850000, stock: 5, file: { url: '/uploads/p1.jpg' } }

function order(overrides: Partial<Order> = {}): Order {
  return {
    _id: 'o1',
    orderNumber: 'EF-260930-ABCDEF',
    user: 'u1',
    items: [{ product: 'p1', productName: 'Grey Sofa', unitPrice: 3850000, quantity: 1, lineTotal: 3850000, status: 'processing', imageUrl: '/uploads/p1.jpg' }],
    subtotal: 3850000,
    deliveryFee: 0,
    total: 3850000,
    address: home,
    status: 'pending_payment',
    statusHistory: [{ status: 'pending_payment', at: '2026-09-30T10:00:00.000Z', note: 'Order placed' }],
    payment: { razorpayOrderId: 'order_rzp1' },
    createdAt: '2026-09-30T10:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
    ...overrides,
  }
}
const paid = () =>
  order({
    status: 'processing',
    payment: { razorpayOrderId: 'order_rzp1', razorpayPaymentId: 'pay_1', paidAt: '2026-09-30T10:01:00.000Z' },
    statusHistory: [
      { status: 'pending_payment', at: '2026-09-30T10:00:00.000Z', note: 'Order placed' },
      { status: 'processing', at: '2026-09-30T10:01:00.000Z', note: 'Payment confirmed' },
    ],
  })

const payment: PaymentOptions = {
  keyId: 'rzp_test_x',
  razorpayOrderId: 'order_rzp1',
  amount: 3850000,
  currency: 'INR',
  name: 'E-Furniture',
  description: 'Order EF-260930-ABCDEF',
  prefill: { email: 'asha@example.com' },
}
const rzpResult = { razorpay_order_id: 'order_rzp1', razorpay_payment_id: 'pay_1', razorpay_signature: 'sig' }

function httpError(status: number, message: string) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('x', 'ERR', config, {}, { status, statusText: '', headers: {}, config, data: { message } })
}

beforeEach(() => {
  vi.resetAllMocks()
  auth.fetchCurrentUser.mockResolvedValue(asha)
  addresses.fetchAddresses.mockResolvedValue([home])
  const cart = buildCart([{ product: sofa, quantity: 1 }])
  checkout.fetchCheckoutSummary.mockResolvedValue({
    ...cart,
    deliveryFee: 0,
    total: cart.subtotal,
    freeDeliveryFrom: 2000000,
    amountForFreeDelivery: 0,
    address: home,
    canPlaceOrder: true,
    blockers: [],
  })
})

// Checkout, with the order page as where it navigates to.
const renderCheckout = () =>
  renderRoute(<CheckoutPage />, { path: '/checkout', routes: [{ path: '/orders/:id', element: <OrderPage /> }] })
const clickPay = async () => userEvent.click(await screen.findByRole('button', { name: 'Pay ₹38,500' }))

describe('paying at checkout', () => {
  test('places the order, opens Razorpay, verifies, and shows the paid order', async () => {
    orders.placeOrder.mockResolvedValue({ order: order(), payment })
    openCheckout.mockResolvedValue(rzpResult)
    orders.verifyPayment.mockResolvedValue(paid())
    orders.fetchOrder.mockResolvedValue(paid())
    renderCheckout()

    await clickPay()
    expect(await screen.findByText('Thank you! Your payment was received.')).toBeInTheDocument()
    expect(orders.placeOrder).toHaveBeenCalledWith('a1')
    expect(openCheckout).toHaveBeenCalledWith(payment)
    expect(orders.verifyPayment).toHaveBeenCalledWith('o1', rzpResult)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Order EF-260930-ABCDEF')
  })

  test('closing Razorpay leaves an unpaid order the customer can pay or cancel', async () => {
    orders.placeOrder.mockResolvedValue({ order: order(), payment })
    openCheckout.mockRejectedValue(new razorpay.PaymentDismissedError())
    orders.fetchOrder.mockResolvedValue(order())
    renderCheckout()

    await clickPay()
    const section = await screen.findByRole('region', { name: 'Complete payment' })
    expect(section).toHaveTextContent('Payment wasn’t completed.')
    expect(within(section).getByRole('button', { name: 'Pay ₹38,500' })).toBeEnabled()
    expect(within(section).getByRole('button', { name: 'Cancel order' })).toBeInTheDocument()
    expect(orders.verifyPayment).not.toHaveBeenCalled()
  })

  test('a payment the server can’t verify is explained on the order page', async () => {
    orders.placeOrder.mockResolvedValue({ order: order(), payment })
    openCheckout.mockResolvedValue(rzpResult)
    orders.verifyPayment.mockRejectedValue(httpError(400, 'We couldn’t verify this payment. If money was taken, it will be refunded.'))
    orders.fetchOrder.mockResolvedValue(order())
    renderCheckout()

    await clickPay()
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t verify this payment')
  })

  test('if the order can’t be placed, checkout says why and nothing opens', async () => {
    orders.placeOrder.mockRejectedValue(httpError(409, 'Grey Sofa has just sold out or has fewer left. Please check your cart.'))
    renderCheckout()
    await clickPay()
    expect(await screen.findByRole('alert')).toHaveTextContent('Grey Sofa has just sold out')
    expect(openCheckout).not.toHaveBeenCalled()
  })
})

describe('order page', () => {
  test('an unpaid order can be paid again with the same order', async () => {
    orders.fetchOrder.mockResolvedValueOnce(order()).mockResolvedValue(paid())
    orders.retryPayment.mockResolvedValue({ order: order(), payment })
    openCheckout.mockResolvedValue(rzpResult)
    orders.verifyPayment.mockResolvedValue(paid())
    renderRoute(<OrderPage />, { path: '/orders/:id', at: '/orders/o1' })

    await userEvent.click(await screen.findByRole('button', { name: 'Pay ₹38,500' }))
    expect(await screen.findByText('Thank you! Your payment was received.')).toBeInTheDocument()
    expect(orders.retryPayment).toHaveBeenCalledWith('o1')
    expect(orders.placeOrder).not.toHaveBeenCalled()
  })

  test('an unpaid order can be cancelled after confirming', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    orders.fetchOrder.mockResolvedValueOnce(order()).mockResolvedValue(order({ status: 'cancelled', cancelReason: 'Cancelled by the customer' }))
    orders.cancelOrder.mockResolvedValue(order({ status: 'cancelled' }))
    renderRoute(<OrderPage />, { path: '/orders/:id', at: '/orders/o1' })

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel order' }))
    expect(orders.cancelOrder).toHaveBeenCalledWith('o1', expect.anything())
    expect(await screen.findByText('This order was cancelled: Cancelled by the customer.')).toBeInTheDocument()
  })

  test('a paid order shows item progress, the address and its history', async () => {
    orders.fetchOrder.mockResolvedValue(paid())
    renderRoute(<OrderPage />, { path: '/orders/:id', at: '/orders/o1' })
    const items = await screen.findByRole('region', { name: 'Items' })
    expect(within(items).getByText('Preparing')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Delivery address' })).toHaveTextContent('Ahmedabad, Gujarat 380009')
    expect(screen.getByRole('region', { name: 'History' })).toHaveTextContent('Payment confirmed')
    expect(screen.queryByRole('region', { name: 'Complete payment' })).not.toBeInTheDocument()
  })

  test('someone else’s order is a not-found page', async () => {
    orders.fetchOrder.mockRejectedValue(httpError(404, 'Order not found'))
    renderRoute(<OrderPage />, { path: '/orders/:id', at: '/orders/o9' })
    expect(await screen.findByText('We can’t find that page')).toBeInTheDocument()
  })
})

test('the orders list links to each order with its status and total', async () => {
  orders.fetchMyOrders.mockResolvedValue({ data: [paid(), order({ _id: 'o2', orderNumber: 'EF-260930-ZZZZZZ' })], meta: { page: 1, limit: 10, total: 2, pages: 1 } })
  renderRoute(<OrdersPage />, { path: '/orders' })
  const first = await screen.findByRole('link', { name: /EF-260930-ABCDEF/ })
  expect(first).toHaveAttribute('href', '/orders/o1')
  expect(first).toHaveTextContent('Preparing')
  expect(screen.getByRole('link', { name: /EF-260930-ZZZZZZ/ })).toHaveTextContent('Payment pending')
  await waitFor(() => expect(orders.fetchMyOrders).toHaveBeenCalledWith(1))
})
