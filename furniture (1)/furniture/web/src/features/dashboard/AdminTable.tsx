import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { errorMessage } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Alert, EmptyState, Skeleton } from '@/components/ui/misc'

/** Loading, error and empty states around an admin list, then the table itself. */
export function AdminTable<T>({
  query,
  empty,
  columns,
  children,
}: {
  query: UseQueryResult<T[]>
  empty: string
  columns: string[]
  children: (items: T[]) => ReactNode
}) {
  if (query.isPending) {
    return (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">Loading…</span>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    )
  }
  if (query.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert className="w-full">{errorMessage(query.error)}</Alert>
        <Button variant="secondary" onClick={() => query.refetch()}>
          Try again
        </Button>
      </div>
    )
  }
  if (query.data.length === 0) return <EmptyState title={empty} />

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
          <tr>
            {columns.map((c, i) => (
              <th key={i} scope="col" className="px-4 py-3 font-medium">
                {c || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children(query.data)}</tbody>
      </table>
    </div>
  )
}
