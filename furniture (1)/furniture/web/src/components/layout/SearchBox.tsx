import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { cn } from '@/lib/cn'

/** Searches the shop: submitting goes to /shop?q=<text>. */
export function SearchBox({ className, onSearch }: { className?: string; onSearch?: () => void }) {
  const [params] = useSearchParams()
  const [text, setText] = useState(params.get('q') ?? '')
  const navigate = useNavigate()

  function submit(event: FormEvent) {
    event.preventDefault()
    const q = text.trim()
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop')
    onSearch?.()
  }

  return (
    <form role="search" onSubmit={submit} className={cn('relative', className)}>
      <label htmlFor="site-search" className="sr-only">
        Search furniture
      </label>
      <svg
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 1 0 3.36 9.86l3.64 3.64a.75.75 0 1 0 1.06-1.06l-3.64-3.64A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        id="site-search"
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search sofas, beds, chairs…"
        className="h-10 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-sm placeholder:text-muted/70 focus:border-walnut focus:ring-2 focus:ring-walnut/20 focus:outline-none"
      />
    </form>
  )
}
