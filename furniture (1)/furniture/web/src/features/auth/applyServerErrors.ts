import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { fieldErrors } from '@/api/client'

/**
 * Shows the API's per-field validation messages under the matching inputs.
 * Returns true if any were applied, so the caller can skip a general alert.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>, fields: Array<Path<T>>): boolean {
  const errors = fieldErrors(error)
  let applied = false
  for (const field of fields) {
    if (errors[field]) {
      setError(field, { type: 'server', message: errors[field] })
      applied = true
    }
  }
  return applied
}
