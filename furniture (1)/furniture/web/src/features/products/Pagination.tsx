import { Link, useSearchParams } from 'react-router'
import { cn } from '@/lib/cn'
import { pageItems, withPage } from './filters'

const itemClasses = 'inline-flex size-10 items-center justify-center rounded-full text-sm font-medium'

/** Numbered page links. Real links, so pages can be opened in a new tab. */
export function Pagination({ page, pages }: { page: number; pages: number }) {
  const [params] = useSearchParams()
  if (pages <= 1) return null
  const href = (n: number) => ({ search: withPage(params, n).toString() })

  const arrow = (n: number, label: string, path: string) =>
    n < 1 || n > pages ? (
      <span className={cn(itemClasses, 'text-muted/50')} aria-hidden="true">
        <Arrow path={path} />
      </span>
    ) : (
      <Link to={href(n)} className={cn(itemClasses, 'hover:bg-sand')} aria-label={label}>
        <Arrow path={path} />
      </Link>
    )

  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-1">
      {arrow(page - 1, 'Previous page', 'M12.5 15 7.5 10l5-5')}
      {pageItems(page, pages).map((item, i) =>
        item === 'gap' ? (
          <span key={`gap-${i}`} className={cn(itemClasses, 'text-muted')}>
            …
          </span>
        ) : (
          <Link
            key={item}
            to={href(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(itemClasses, item === page ? 'bg-walnut text-cream' : 'hover:bg-sand')}
          >
            {item}
          </Link>
        ),
      )}
      {arrow(page + 1, 'Next page', 'm7.5 5 5 5-5 5')}
    </nav>
  )
}

function Arrow({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
