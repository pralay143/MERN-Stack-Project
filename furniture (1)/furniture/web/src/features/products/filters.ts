// The shop's filters live in the URL (?q=&category=&brand=&sort=&page=), so a
// filtered page can be shared, bookmarked and reached with the back button.
// Values the API would reject are dropped here, so a hand-edited URL shows
// the unfiltered shop instead of an error.

export const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
] as const

export type Sort = (typeof SORTS)[number]['value']

export interface ShopFilters {
  q: string
  category: string
  brand: string
  sort: Sort
  page: number
}

/** Keys that narrow the results; changing any of them starts again at page 1. */
export type FilterKey = 'q' | 'category' | 'brand' | 'sort'

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value)
const isSort = (value: string | null): value is Sort => SORTS.some((s) => s.value === value)

export function parseFilters(params: URLSearchParams): ShopFilters {
  const category = params.get('category') ?? ''
  const brand = params.get('brand') ?? ''
  const sort = params.get('sort')
  const page = Number(params.get('page'))
  return {
    q: (params.get('q') ?? '').trim().slice(0, 100),
    category: isObjectId(category) ? category : '',
    brand: isObjectId(brand) ? brand : '',
    sort: isSort(sort) ? sort : 'newest',
    page: Number.isInteger(page) && page > 1 ? page : 1,
  }
}

/** True when anything narrows the results (the sort order doesn't). */
export function hasActiveFilters(filters: ShopFilters): boolean {
  return Boolean(filters.q || filters.category || filters.brand)
}

/** `params` with one filter changed (removed when empty) and the page reset. */
export function withFilter(params: URLSearchParams, key: FilterKey, value: string): URLSearchParams {
  const next = new URLSearchParams(params)
  if (value) next.set(key, value)
  else next.delete(key)
  next.delete('page')
  return next
}

/** `params` pointing at `page` (page 1 is left out of the URL). */
export function withPage(params: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(params)
  if (page > 1) next.set('page', String(page))
  else next.delete('page')
  return next
}

/** `params` without the filters that narrow results; the sort order is kept. */
export function withoutFilters(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams()
  const sort = params.get('sort')
  if (sort) next.set('sort', sort)
  return next
}

/**
 * Page numbers to show, with 'gap' where a run is skipped:
 * (6, 12) → [1, 'gap', 5, 6, 7, 'gap', 12]. Short lists are shown in full.
 */
export function pageItems(current: number, pages: number): Array<number | 'gap'> {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const start = Math.max(2, Math.min(current - 1, pages - 4))
  const end = Math.min(pages - 1, Math.max(current + 1, 5))
  const items: Array<number | 'gap'> = [1]
  if (start > 2) items.push('gap')
  for (let page = start; page <= end; page++) items.push(page)
  if (end < pages - 1) items.push('gap')
  items.push(pages)
  return items
}
