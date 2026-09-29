import { Link } from 'react-router'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-ink">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-walnut" />
        <path
          d="M9 18h14v3H9zM10 11h12v7H10zM10 21v4M22 21v4"
          className="stroke-cream"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      E-Furniture
    </Link>
  )
}
