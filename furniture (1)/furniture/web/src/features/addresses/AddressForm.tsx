import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { errorMessage } from '@/api/client'
import type { Address } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { SelectField, TextField } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { INDIAN_STATES } from '@/lib/indianStates'
import { applyServerErrors } from '@/features/auth/applyServerErrors'
import { useCreateAddress } from './hooks'
import { addressSchema, type AddressFormInput, type AddressValues } from './schema'

const FIELDS = ['fullName', 'phone', 'line1', 'line2', 'landmark', 'city', 'state', 'pincode'] as const

/** Adds a delivery address. Calls onSaved with the new address. */
export function AddressForm({
  defaultName = '',
  onSaved,
  onCancel,
  canBeDefault = true,
}: {
  defaultName?: string
  onSaved: (address: Address) => void
  onCancel?: () => void
  /** False for the very first address, which is always the default. */
  canBeDefault?: boolean
}) {
  const create = useCreateAddress()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AddressFormInput, unknown, AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { fullName: defaultName, phone: '', line1: '', line2: '', landmark: '', city: '', state: '' as never, pincode: '', isDefault: false },
  })

  const onSubmit = (values: AddressValues) =>
    create.mutate(values, {
      onSuccess: onSaved,
      onError: (error) => applyServerErrors(error, setError, [...FIELDS]),
    })

  const showAlert = create.isError && Object.keys(errors).length === 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4" aria-label="New address">
      {showAlert && <Alert>{errorMessage(create.error)}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <TextField label="Mobile number" type="tel" autoComplete="tel" hint="For the delivery team." error={errors.phone?.message} {...register('phone')} />
      </div>
      <TextField label="House / flat, street" autoComplete="address-line1" error={errors.line1?.message} {...register('line1')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Area, locality (optional)" autoComplete="address-line2" error={errors.line2?.message} {...register('line2')} />
        <TextField label="Landmark (optional)" error={errors.landmark?.message} {...register('landmark')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="City" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
        <SelectField label="State" autoComplete="address-level1" error={errors.state?.message} {...register('state')}>
          <option value="">Choose…</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectField>
        <TextField label="PIN code" inputMode="numeric" autoComplete="postal-code" error={errors.pincode?.message} {...register('pincode')} />
      </div>
      {canBeDefault && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-walnut" {...register('isDefault')} />
          Make this my default address
        </label>
      )}
      <div className="flex gap-3">
        <Button type="submit" loading={create.isPending}>
          Save address
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

/** One address as a few lines of text. */
export function AddressLines({ address }: { address: Address }) {
  return (
    <span className="flex flex-col text-sm">
      <span className="font-medium">{address.fullName}</span>
      <span className="text-muted">
        {[address.line1, address.line2, address.landmark].filter(Boolean).join(', ')}
      </span>
      <span className="text-muted">
        {address.city}, {address.state} {address.pincode}
      </span>
      <span className="text-muted">Mobile: {address.phone}</span>
    </span>
  )
}
