import { describe, expect, test } from 'vitest'
import { loginPathFor, safeNextPath } from './redirect'

describe('safeNextPath', () => {
  test('allows paths on this site', () => {
    expect(safeNextPath('/account')).toBe('/account')
    expect(safeNextPath('/shop?q=sofa')).toBe('/shop?q=sofa')
  })

  test('rejects anything that could leave the site', () => {
    for (const next of ['https://evil.example.com', '//evil.example.com', '/\\evil.example.com', 'javascript:alert(1)', 'account']) {
      expect(safeNextPath(next)).toBe('/')
    }
  })

  test('uses the fallback when missing', () => {
    expect(safeNextPath(null, '/shop')).toBe('/shop')
  })
})

test('loginPathFor encodes the return path', () => {
  expect(loginPathFor('/shop?q=sofa bed')).toBe('/login?next=%2Fshop%3Fq%3Dsofa%20bed')
})
