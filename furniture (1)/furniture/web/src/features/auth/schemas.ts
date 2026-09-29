import { z } from 'zod'

// Same rules as the API (server/src/modules/auth/auth.validation.js), so most
// mistakes are caught before the request is sent.

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email'),
  password: z.string().min(1, 'Enter your password'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(100, 'Name must be at most 100 characters'),
  email: z.string().trim().min(1, 'Enter your email').pipe(z.email('Enter a valid email address')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
  contactNum: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\+?[\d\s-]{7,15}$/.test(v), 'Phone number must be 7–15 digits')
    .optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
