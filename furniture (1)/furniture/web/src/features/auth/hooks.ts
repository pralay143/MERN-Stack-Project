import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { RoleName, User } from '@/api/types'
import { fetchCurrentUser, login, logout, register } from './api'

const CURRENT_USER = ['auth', 'me'] as const

/** The logged-in user (null when logged out). The query cache is the auth store. */
export function useCurrentUser() {
  const query = useQuery({ queryKey: CURRENT_USER, queryFn: fetchCurrentUser, staleTime: 5 * 60_000 })
  return { user: query.data ?? null, isLoading: query.isPending, error: query.error }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(CURRENT_USER, user),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: register,
    onSuccess: (user) => queryClient.setQueryData(CURRENT_USER, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(CURRENT_USER, null)
      // Drop anything fetched as the previous user.
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'auth' })
    },
  })
}

export function hasRole(user: User | null, ...roles: RoleName[]): boolean {
  return Boolean(user?.role && roles.includes(user.role.name))
}
