import { expect, test } from 'vitest'
import { stockStatus } from './stock'

test('stock labels', () => {
  expect(stockStatus(0)).toEqual({ label: 'Sold out', tone: 'out' })
  expect(stockStatus(1)).toEqual({ label: 'Only 1 left', tone: 'low' })
  expect(stockStatus(3)).toEqual({ label: 'Only 3 left', tone: 'low' })
  expect(stockStatus(4)).toEqual({ label: 'In stock', tone: 'ok' })
})
