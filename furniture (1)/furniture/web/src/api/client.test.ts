import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, test } from 'vitest'
import { assetUrl, errorMessage, errorStatus, fieldErrors } from './client'

// Builds the error axios throws for an HTTP error response.
function httpError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, {}, { status, statusText: '', headers: {}, config, data })
}

describe('error helpers', () => {
  test('use the message and field errors the API sent', () => {
    const error = httpError(400, { message: 'Validation failed', errors: { email: 'Enter a valid email address' } })
    expect(errorStatus(error)).toBe(400)
    expect(errorMessage(error)).toBe('Validation failed')
    expect(fieldErrors(error)).toEqual({ email: 'Enter a valid email address' })
  })

  test('explain network failures', () => {
    const networkError = new AxiosError('Network Error', 'ERR_NETWORK')
    expect(errorStatus(networkError)).toBeUndefined()
    expect(errorMessage(networkError)).toMatch(/Cannot reach the server/)
  })

  test('fall back for unexpected errors', () => {
    expect(errorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.')
    expect(fieldErrors(new Error('boom'))).toEqual({})
  })
})

describe('assetUrl', () => {
  test('keeps API paths on the API origin (same origin in development)', () => {
    expect(assetUrl('/uploads/abc.png')).toBe('/uploads/abc.png')
  })

  test('leaves absolute URLs alone and passes undefined through', () => {
    expect(assetUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
    expect(assetUrl(undefined)).toBeUndefined()
  })
})
