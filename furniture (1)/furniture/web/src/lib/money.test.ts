import { describe, expect, test } from 'vitest'
import { formatPaise, rupeesToPaise } from './money'

describe('formatPaise', () => {
  test('shows whole rupees without decimals, with Indian grouping', () => {
    expect(formatPaise(2550000)).toBe('₹25,500')
    expect(formatPaise(1250000000)).toBe('₹1,25,00,000')
  })

  test('shows paise when there are any', () => {
    expect(formatPaise(2550050)).toBe('₹25,500.50')
    expect(formatPaise(5)).toBe('₹0.05')
  })

  test('zero', () => {
    expect(formatPaise(0)).toBe('₹0')
  })
})

describe('rupeesToPaise', () => {
  test('converts numbers and typed text', () => {
    expect(rupeesToPaise(25500)).toBe(2550000)
    expect(rupeesToPaise('25,500.5')).toBe(2550050)
    expect(rupeesToPaise('₹ 1,200')).toBe(120000)
  })

  test('rounds to whole paise', () => {
    expect(rupeesToPaise('0.105')).toBe(11)
  })

  test('returns NaN for text that is not a number', () => {
    expect(rupeesToPaise('cheap')).toBeNaN()
  })
})
