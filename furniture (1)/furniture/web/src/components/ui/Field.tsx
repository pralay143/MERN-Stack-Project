import { useId, type InputHTMLAttributes, type ReactNode, type Ref, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const controlClasses = (invalid: boolean) =>
  cn(
    'w-full rounded-xl border bg-surface px-4 text-sm text-ink placeholder:text-muted/70 transition-colors',
    'focus:border-walnut focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-walnut/20',
    'disabled:cursor-not-allowed disabled:bg-sand',
    invalid ? 'border-danger' : 'border-line',
  )

type FieldFrameProps = {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  children: ReactNode
}

/** Label, control, and the hint or error below it, wired up for screen readers. */
function FieldFrame({ id, label, error, hint, children }: FieldFrameProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

const describedBy = (id: string, error?: string, hint?: ReactNode) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: ReactNode
}

export function TextField({ label, error, hint, id, className, ref, ...props }: TextFieldProps & { ref?: Ref<HTMLInputElement> }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldFrame id={fieldId} label={label} error={error} hint={hint}>
      <input
        id={fieldId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(controlClasses(Boolean(error)), 'h-11', className)}
        {...props}
      />
    </FieldFrame>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: ReactNode
}

export function SelectField({ label, error, hint, id, className, children, ref, ...props }: SelectFieldProps & { ref?: Ref<HTMLSelectElement> }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldFrame id={fieldId} label={label} error={error} hint={hint}>
      <div className="relative">
        <select
          id={fieldId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(controlClasses(Boolean(error)), 'h-11 appearance-none pr-10', className)}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
        </svg>
      </div>
    </FieldFrame>
  )
}
