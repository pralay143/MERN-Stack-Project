import { useSyncExternalStore } from 'react'

// Whether CartSync is moving a visitor's browser cart into their account.
// Pages that read the account cart (checkout) wait for it, so they don't
// briefly show an empty cart right after logging in.

let merging = false
const listeners = new Set<() => void>()

export function isMerging() {
  return merging
}

export function setMerging(value: boolean) {
  merging = value
  listeners.forEach((notify) => notify())
}

export function useCartMerging() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify)
      return () => listeners.delete(notify)
    },
    isMerging,
    () => false,
  )
}
