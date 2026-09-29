import { Link } from 'react-router'
import { useCart } from './hooks'

/** Header cart icon with the number of items. */
export function CartLink() {
  const { cart } = useCart()
  const count = cart?.itemCount ?? 0
  const label = count === 0 ? 'Cart, empty' : `Cart, ${count} ${count === 1 ? 'item' : 'items'}`

  return (
    <Link to="/cart" aria-label={label} className="relative inline-flex size-10 items-center justify-center rounded-full hover:bg-sand">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
        <circle cx="9.5" cy="20" r="1.2" />
        <circle cx="17" cy="20" r="1.2" />
      </svg>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[11px] leading-5 font-semibold text-white"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
