import { api, errorStatus } from '@/api/client'
import type { ApiResponse, User } from '@/api/types'

export type LoginInput = { email: string; password: string }
export type RegisterInput = { name: string; email: string; password: string; contactNum?: string }

/** The logged-in user, or null when nobody is logged in. */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')
    return data.data
  } catch (error) {
    if (errorStatus(error) === 401) return null
    throw error
  }
}

export async function login(input: LoginInput): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>('/auth/login', input)
  return data.data
}

/** Creates a Customer account and logs it in. */
export async function register(input: RegisterInput): Promise<User> {
  const { data } = await api.post<ApiResponse<User>>('/auth/register', input)
  return data.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
