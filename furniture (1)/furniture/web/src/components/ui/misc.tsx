import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Centres page content with consistent side padding. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'accent'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tone === 'accent' ? 'bg-terracotta text-white' : 'bg-walnut-light text-walnut-dark',
      )}
    >
      {children}
    </span>
  )
}

/** Grey placeholder shown while content loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-sand', className)} />
}

export function Alert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="alert" className={cn('rounded-xl border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger', className)}>
      {children}
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line px-6 py-16 text-center">
      <h2 className="text-xl">{title}</h2>
      {children && <p className="max-w-md text-muted">{children}</p>}
      {action}
    </div>
  )
}
