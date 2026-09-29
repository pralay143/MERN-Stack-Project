import { useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * A small quantity picker (1..max). The current value stays selectable even
 * above max, so a line with too many for the stock still shows what's in it.
 */
export function QuantitySelect({
  value,
  max,
  onChange,
  label,
  disabled,
  className,
}: {
  value: number
  max: number
  onChange: (quantity: number) => void
  /** Accessible name, e.g. "Quantity of Grey Sofa". */
  label: string
  disabled?: boolean
  className?: string
}) {
  const id = useId()
  const options = Array.from({ length: Math.max(max, value, 1) }, (_, i) => i + 1)
  return (
    <div className={cn('relative inline-block', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-10 appearance-none rounded-full border border-line bg-surface pr-9 pl-4 text-sm font-medium focus:border-walnut focus:ring-2 focus:ring-walnut/20 focus:outline-none disabled:opacity-50"
      >
        {options.map((n) => (
          <option key={n} value={n} disabled={n > max}>
            {n}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
      </svg>
    </div>
  )
}
