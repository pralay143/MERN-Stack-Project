import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { errorMessage, errorStatus, fieldErrors } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { nameSchema } from './schemas'

/** A message for a failed save of a name; 409 means another record already has it. */
function nameError(error: unknown): string {
  if (errorStatus(error) === 409) return 'That name is already taken'
  return Object.values(fieldErrors(error))[0] ?? errorMessage(error)
}

/**
 * "Add a <label>" form with a name field. `extra` holds other fields; `onAdd`
 * resolves when saved (the form then clears) or throws to show the error.
 */
export function AddByNameForm({ label, onAdd, extra }: { label: string; onAdd: (name: string) => Promise<unknown>; extra?: ReactNode }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string }>({ resolver: zodResolver(nameSchema(label)), defaultValues: { name: '' } })

  const submit = handleSubmit(async ({ name }) => {
    try {
      await onAdd(name)
      reset()
    } catch (error) {
      setError('name', { type: 'server', message: nameError(error) })
    }
  })

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 sm:flex-row sm:items-start">
      <div className="flex-1">
        <TextField label={`New ${label.toLowerCase()}`} error={errors.name?.message} {...register('name')} />
      </div>
      {extra && <div className="flex-1">{extra}</div>}
      <Button type="submit" loading={isSubmitting} className="sm:mt-7">
        Add {label.toLowerCase()}
      </Button>
    </form>
  )
}

/** A name with a Rename button that turns it into an input with Save / Cancel. */
export function EditableName({ name, label, onSave }: { name: string; label: string; onSave: (name: string) => Promise<unknown> }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(name)
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  async function save(event: FormEvent) {
    event.preventDefault()
    const next = text.trim()
    if (!next) return setError('Enter a name')
    if (next === name) return setEditing(false)
    setSaving(true)
    try {
      await onSave(next)
      setEditing(false)
      setError(undefined)
    } catch (err) {
      setError(nameError(err))
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{name}</span>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Rename ${name}`}
          onClick={() => {
            setText(name)
            setError(undefined)
            setEditing(true)
          }}
        >
          Rename
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-start gap-2">
      <div className="w-56">
        <TextField label={`${label} name`} className="h-9" value={text} onChange={(e) => setText(e.target.value)} error={error} autoFocus />
      </div>
      <div className="mt-7 flex gap-2">
        <Button type="submit" size="sm" loading={saving}>
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
