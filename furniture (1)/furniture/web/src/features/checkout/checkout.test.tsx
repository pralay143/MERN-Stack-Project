import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { Address, User } from '@/api/types'
import { AccountPage } from '@/pages/AccountPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { renderRoute } from '@/test/render'
import * as addressesApi from '@/features/addresses/api'
import * as authApi from '@/features/auth/api'
import * as cartApi from '@/features/cart/api'
import { CartSync } from '@/features/cart/CartSync'
import { setGuestQuantity, writeGuestCart } from '@/features/cart/guestCart'
import { buildCart } from '@/features/cart/hooks'
import * as checkoutApi from './api'
import type { CheckoutSummary } from './api'

vi.mock('@/features/auth/api')
vi.mock('@/features/addresses/api')
vi.mock('./api')
vi.mock('@/features/cart/api')
const auth = vi.mocked(authApi)
const addresses = vi.mocked(addressesApi)
const checkout = vi.mocked(checkoutApi)
const cart = vi.mocked(cartApi)

const asha: User = {
  _id: 'u1',
  name: 'Asha Patel',
  email: 'asha@example.com',
  role: { _id: 'r1', name: 'Customer' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const home: Address = {
  _id: 'a1',
  fullName: 'Asha Patel',
  phone: '9876543210',
  line1: '12 Shanti Nagar',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pincode: '380009',
  isDefault: true,
}
const office: Address = { ...home, _id: 'a2', line1: 'Office, CG Road', city: 'Gandhinagar', isDefault: false }

const sofa = { _id: 'p1', productName: 'Grey Sofa', price: 3850000, stock: 5, file: { url: '/uploads/p1.jpg' } }

function summary(overrides: Partial<CheckoutSummary> = {}): CheckoutSummary {
  const cart = buildCart([{ product: sofa, quantity: 1 }])
  return {
    ...cart,
    deliveryFee: 0,
    total: cart.subtotal,
    freeDeliveryFrom: 2000000,
    amountForFreeDelivery: 0,
    address: home,
    canPlaceOrder: true,
    blockers: [],
    ...overrides,
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  auth.fetchCurrentUser.mockResolvedValue(asha)
  addresses.fetchAddresses.mockResolvedValue([home, office])
  checkout.fetchCheckoutSummary.mockImplementation(async (id) => summary({ address: id === 'a2' ? office : home }))
})

const renderCheckout = () => renderRoute(<CheckoutPage />, { path: '/checkout' })

describe('checkout', () => {
  test('shows the default address, the items and the server’s totals', async () => {
    renderCheckout()
    expect(await screen.findByRole('radio', { name: /12 Shanti Nagar/ })).toBeChecked()
    expect(screen.getByRole('region', { name: '2. Items' })).toHaveTextContent('Grey Sofa')
    const aside = screen.getByRole('complementary', { name: 'Order summary' })
    expect(within(aside).getByText('Free')).toBeInTheDocument()
    expect(within(aside).getByRole('button', { name: 'Pay ₹38,500' })).toBeEnabled()
  })

  test('choosing another address asks the server again for that address', async () => {
    renderCheckout()
    await userEvent.click(await screen.findByRole('radio', { name: /Office, CG Road/ }))
    await waitFor(() => expect(checkout.fetchCheckoutSummary).toHaveBeenLastCalledWith('a2'))
    await waitFor(() => expect(screen.getByRole('radio', { name: /Office, CG Road/ })).toBeChecked())
  })

  test('the server’s reasons are listed when the order can’t be placed', async () => {
    checkout.fetchCheckoutSummary.mockResolvedValue(summary({ canPlaceOrder: false, blockers: ['Some items are sold out'] }))
    renderCheckout()
    expect(await screen.findByText('Some items are sold out')).toBeInTheDocument()
  })

  test('an empty cart points back to the shop', async () => {
    checkout.fetchCheckoutSummary.mockResolvedValue(summary({ items: [], itemCount: 0, subtotal: 0, total: 0 }))
    renderCheckout()
    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument()
  })

  describe('first address', () => {
    beforeEach(() => {
      addresses.fetchAddresses.mockResolvedValue([])
      checkout.fetchCheckoutSummary.mockImplementation(async (id) =>
        id ? summary({ address: { ...home, _id: id } }) : summary({ address: null, canPlaceOrder: false, blockers: ['Add a delivery address'] }),
      )
    })

    test('the form is open, with the name filled in, and checks the fields', async () => {
      renderCheckout()
      expect(await screen.findByLabelText('Full name')).toHaveValue('Asha Patel')
      await userEvent.type(screen.getByLabelText('Mobile number'), '12345')
      await userEvent.type(screen.getByLabelText('PIN code'), '38009')
      await userEvent.click(screen.getByRole('button', { name: 'Save address' }))
      expect(await screen.findByText('Enter a 10-digit mobile number')).toBeInTheDocument()
      expect(screen.getByText('Enter a 6-digit PIN code')).toBeInTheDocument()
      expect(screen.getByText('Choose a state')).toBeInTheDocument()
      expect(addresses.createAddress).not.toHaveBeenCalled()
    })

    test('saving it sends a clean phone number and uses the new address', async () => {
      addresses.createAddress.mockResolvedValue({ ...home, _id: 'a9' })
      renderCheckout()
      await userEvent.type(await screen.findByLabelText('Mobile number'), '+91 98765-43210')
      await userEvent.type(screen.getByLabelText('House / flat, street'), '12 Shanti Nagar')
      await userEvent.type(screen.getByLabelText('City'), 'Ahmedabad')
      await userEvent.selectOptions(screen.getByLabelText('State'), 'Gujarat')
      await userEvent.type(screen.getByLabelText('PIN code'), '380009')
      await userEvent.click(screen.getByRole('button', { name: 'Save address' }))

      await waitFor(() =>
        expect(addresses.createAddress).toHaveBeenCalledWith(
          expect.objectContaining({ fullName: 'Asha Patel', phone: '9876543210', state: 'Gujarat', pincode: '380009' }),
          expect.anything(),
        ),
      )
      await waitFor(() => expect(checkout.fetchCheckoutSummary).toHaveBeenLastCalledWith('a9'))
    })
  })
})

test('right after logging in, checkout waits for the browser cart to reach the account', async () => {
  writeGuestCart([])
  setGuestQuantity('p1', 1)
  let merged = false
  cart.mergeCart.mockImplementation(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50))
    merged = true
    return buildCart([{ product: sofa, quantity: 1 }])
  })
  cart.fetchCart.mockResolvedValue(buildCart([]))
  // Before the merge lands, the account cart on the server is still empty.
  checkout.fetchCheckoutSummary.mockImplementation(async () =>
    merged ? summary() : summary({ items: [], itemCount: 0, subtotal: 0, total: 0 }),
  )

  renderRoute(
    <>
      <CartSync />
      <CheckoutPage />
    </>,
    { path: '/checkout' },
  )
  expect(await screen.findByRole('region', { name: '2. Items' })).toHaveTextContent('Grey Sofa')
  expect(screen.queryByText('Your cart is empty')).not.toBeInTheDocument()
  expect(cart.mergeCart).toHaveBeenCalledTimes(1)
})

describe('account address book', () => {
  test('lists addresses and can make one the default or delete it', async () => {
    addresses.updateAddress.mockResolvedValue({ ...office, isDefault: true })
    addresses.deleteAddress.mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderRoute(<AccountPage />, { path: '/account' })

    const book = await screen.findByRole('region', { name: 'Saved addresses' })
    expect(await within(book).findByText('Default')).toBeInTheDocument()
    await userEvent.click(within(book).getByRole('button', { name: 'Make default' }))
    expect(addresses.updateAddress).toHaveBeenCalledWith('a2', { isDefault: true })

    await userEvent.click(within(book).getByRole('button', { name: 'Delete the address for Asha Patel, Gandhinagar' }))
    expect(addresses.deleteAddress).toHaveBeenCalledWith('a2', expect.anything())
  })
})
