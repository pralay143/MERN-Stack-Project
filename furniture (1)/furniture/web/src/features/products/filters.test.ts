import { describe, expect, test } from 'vitest'
import { hasActiveFilters, pageItems, parseFilters, withFilter, withoutFilters, withPage } from './filters'

const id = '66f1a2b3c4d5e6f7a8b9c0d1'
const parse = (query: string) => parseFilters(new URLSearchParams(query))

describe('parseFilters', () => {
  test('defaults when the URL has no filters', () => {
    expect(parse('')).toEqual({ q: '', category: '', brand: '', sort: 'newest', page: 1 })
  })

  test('reads every filter', () => {
    expect(parse(`q=+sofa+&category=${id}&brand=${id}&sort=price_asc&page=3`)).toEqual({
      q: 'sofa',
      category: id,
      brand: id,
      sort: 'price_asc',
      page: 3,
    })
  })

  test('drops values the API would reject', () => {
    expect(parse('category=chairs&brand=1&sort=cheapest&page=abc')).toEqual(parse(''))
    expect(parse('page=0').page).toBe(1)
    expect(parse('page=2.5').page).toBe(1)
    expect(parse(`q=${'a'.repeat(150)}`).q).toHaveLength(100)
  })
})

describe('URL updates', () => {
  const params = new URLSearchParams(`q=sofa&sort=name&page=4`)

  test('changing a filter resets the page', () => {
    expect(withFilter(params, 'category', id).toString()).toBe(`q=sofa&sort=name&category=${id}`)
  })

  test('an empty value removes the filter', () => {
    expect(withFilter(params, 'q', '').toString()).toBe('sort=name')
  })

  test('page 1 is left out of the URL', () => {
    expect(withPage(params, 2).get('page')).toBe('2')
    expect(withPage(params, 1).has('page')).toBe(false)
  })

  test('clearing filters keeps the sort order', () => {
    expect(withoutFilters(new URLSearchParams(`q=sofa&brand=${id}&sort=name&page=2`)).toString()).toBe('sort=name')
  })

  test('sorting alone is not an active filter', () => {
    expect(hasActiveFilters(parse('sort=name'))).toBe(false)
    expect(hasActiveFilters(parse('q=bed'))).toBe(true)
  })
})

describe('pageItems', () => {
  test('lists short runs in full', () => {
    expect(pageItems(1, 1)).toEqual([1])
    expect(pageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  test('skips runs on either side of the current page', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 4, 5, 'gap', 12])
    expect(pageItems(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
    expect(pageItems(12, 12)).toEqual([1, 'gap', 8, 9, 10, 11, 12])
  })
})
