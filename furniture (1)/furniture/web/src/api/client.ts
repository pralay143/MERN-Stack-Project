import axios, { isAxiosError } from 'axios'
import type { ApiErrorBody } from './types'

// Empty in development: requests go to this origin and Vite's proxy forwards
// them. Set VITE_API_URL (e.g. https://api.example.com) for a production build
// served from another origin.
const API_ORIGIN = import.meta.env.VITE_API_URL ?? ''

/** The one HTTP client for the API. Sends the login cookie with every request. */
export const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  withCredentials: true,
})

/** Full URL for a file the API serves, e.g. a product image at /uploads/<name>. */
export function assetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  return /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path}`
}

function errorBody(error: unknown): ApiErrorBody | undefined {
  if (isAxiosError<ApiErrorBody>(error)) return error.response?.data
  return undefined
}

/** HTTP status of a failed request, or undefined for network errors. */
export function errorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined
}

/** A message suitable for showing to the user. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError(error) && !error.response) return 'Cannot reach the server. Check your connection and try again.'
  return errorBody(error)?.message ?? fallback
}

/** Per-field validation messages from a 400 response, e.g. { email: 'Enter a valid email address' }. */
export function fieldErrors(error: unknown): Record<string, string> {
  return errorBody(error)?.errors ?? {}
}
