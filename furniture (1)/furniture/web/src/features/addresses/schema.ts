import { z } from 'zod'
import { INDIAN_STATES } from '@/lib/indianStates'

// Same rules as the API (server/src/modules/address/address.validation.js).

const optional = (label: string, max: number) => z.string().trim().max(max, `${label} must be at most ${max} characters`)

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter the name of the person receiving the delivery').max(100, 'Name must be at most 100 characters'),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+91|0)(?=\d{10}$)/, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number')),
  line1: z.string().trim().min(1, 'Enter the house or flat and street').max(200, 'Address line 1 must be at most 200 characters'),
  line2: optional('Address line 2', 200),
  landmark: optional('Landmark', 100),
  city: z.string().trim().min(1, 'Enter the city').max(100, 'City must be at most 100 characters'),
  state: z.enum(INDIAN_STATES, 'Choose a state'),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Enter a 6-digit PIN code'),
  isDefault: z.boolean(),
})

export type AddressFormInput = z.input<typeof addressSchema>
export type AddressValues = z.output<typeof addressSchema>
