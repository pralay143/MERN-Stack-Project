import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { User } from '@/api/types'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { renderRoute } from '@/test/render'
import * as authApi from './api'
import { RequireAuth } from './RequireAuth'

vi.mock('./api')
const mocked = vi.mocked(authApi)

const customer: User = {
  _id: 'u1',
  name: 'Asha Patel',
  email: 'asha@example.com',
  role: { _id: 'r1', name: 'Customer' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function httpError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, {}, { status, statusText: '', headers: {}, config, data })
}

beforeEach(() => {
  vi.resetAllMocks()
  mocked.fetchCurrentUser.mockResolvedValue(null)
})

describe('login page', () => {
  const renderLogin = (at = '/login') =>
    renderRoute(<LoginPage />, {
      path: '/login',
      at,
      routes: [
        { path: '/', element: <p>Home page</p> },
        { path: '/account', element: <p>Account page</p> },
      ],
    })

  test('checks the form before sending it', async () => {
    renderLogin()
    await userEvent.click(await screen.findByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Enter your email')).toBeInTheDocument()
    expect(screen.getByText('Enter your password')).toBeInTheDocument()
    expect(mocked.login).not.toHaveBeenCalled()
  })

  test('shows the server’s message when the details are wrong', async () => {
    mocked.login.mockRejectedValue(httpError(401, { message: 'Invalid email or password' }))
    renderLogin()
    await userEvent.type(await screen.findByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })

  test('goes to the ?next= page after logging in', async () => {
    mocked.login.mockResolvedValue(customer)
    renderLogin('/login?next=%2Faccount')
    await userEvent.type(await screen.findByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Secret@123')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Account page')).toBeInTheDocument()
    expect(mocked.login).toHaveBeenCalledWith({ email: 'asha@example.com', password: 'Secret@123' }, expect.anything())
  })

  test('ignores a ?next= that points to another site', async () => {
    mocked.login.mockResolvedValue(customer)
    renderLogin('/login?next=https%3A%2F%2Fevil.example.com')
    await userEvent.type(await screen.findByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Secret@123')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Home page')).toBeInTheDocument()
  })
})

describe('register page', () => {
  test('shows the server’s field errors under the inputs', async () => {
    mocked.register.mockRejectedValue(
      httpError(400, { message: 'Validation failed', errors: { email: 'Enter a valid email address' } }),
    )
    renderRoute(<RegisterPage />, { path: '/register' })
    await userEvent.type(await screen.findByLabelText('Full name'), 'Asha Patel')
    await userEvent.type(screen.getByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Secret@123')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))

    const email = screen.getByLabelText('Email')
    await waitFor(() => expect(email).toHaveAccessibleDescription('Enter a valid email address'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  test('requires a password of at least 8 characters', async () => {
    renderRoute(<RegisterPage />, { path: '/register' })
    await userEvent.type(await screen.findByLabelText('Password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument()
    expect(mocked.register).not.toHaveBeenCalled()
  })
})

describe('RequireAuth', () => {
  const guarded = (roles?: Array<'Admin' | 'Vendor' | 'Customer'>) => (
    <RequireAuth roles={roles}>
      <p>Secret page</p>
    </RequireAuth>
  )
  const routes = [{ path: '/login', element: <p>Login page</p> }]

  test('sends logged-out visitors to the login page with a return path', async () => {
    const { router } = renderRoute(guarded(), { path: '/account', at: '/account?tab=orders', routes })
    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?next=%2Faccount%3Ftab%3Dorders')
  })

  test('shows the page to a logged-in user', async () => {
    mocked.fetchCurrentUser.mockResolvedValue(customer)
    renderRoute(guarded(), { path: '/account', routes })
    expect(await screen.findByText('Secret page')).toBeInTheDocument()
  })

  test('blocks roles that are not allowed', async () => {
    mocked.fetchCurrentUser.mockResolvedValue(customer)
    renderRoute(guarded(['Admin']), { path: '/admin', routes })
    expect(await screen.findByText('This page isn’t available to your account')).toBeInTheDocument()
    expect(screen.queryByText('Secret page')).not.toBeInTheDocument()
  })
})
