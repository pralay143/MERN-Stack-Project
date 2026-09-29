import type { Id } from '@/api/types'
import type { StoredCartItem } from './types'

// A visitor's cart before they log in, kept in localStorage (product ids and
// quantities only; prices are always fetched fresh). It moves into their
// account when they log in (see CartSync).

const KEY = 'efurniture.cart'
const listeners = new Set<() => void>()
let cached: StoredCartItem[] | null = null

function isItem(value: unknown): value is StoredCartItem {
  const item = value as StoredCartItem
  return typeof item?.productId === 'string' && Number.isInteger(item.quantity) && item.quantity > 0
}

function load(): StoredCartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isItem) : []
  } catch {
    // Storage can be unavailable (private mode) or hold junk.
    return []
  }
}

/** The stored items. The same array is returned until they change (for useSyncExternalStore). */
export function readGuestCart(): StoredCartItem[] {
  cached ??= load()
  return cached
}

export function writeGuestCart(items: StoredCartItem[]) {
  cached = items
  try {
    if (items.length) localStorage.setItem(KEY, JSON.stringify(items))
    else localStorage.removeItem(KEY)
  } catch {
    // Keep working in memory if storage is unavailable.
  }
  listeners.forEach((notify) => notify())
}

export function setGuestQuantity(productId: Id, quantity: number) {
  const items = readGuestCart()
  const exists = items.some((item) => item.productId === productId)
  writeGuestCart(
    exists
      ? items.map((item) => (item.productId === productId ? { ...item, quantity } : item))
      : [...items, { productId, quantity }],
  )
}

export function removeGuestItem(productId: Id) {
  writeGuestCart(readGuestCart().filter((item) => item.productId !== productId))
}

/** Subscribe to changes, including ones made in other tabs. */
export function subscribeGuestCart(notify: () => void) {
  listeners.add(notify)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return
    cached = null
    notify()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(notify)
    window.removeEventListener('storage', onStorage)
  }
}
