import { z } from 'zod'
import { rupeesToPaise } from '@/lib/money'

// Same limits as the API (server/src/modules/product/product.validation.js
// and middleware/upload.js), so most mistakes are caught before sending.

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_MB = 5

const price = z
  .string()
  .trim()
  .min(1, 'Enter a price')
  .refine((v) => Number.isFinite(rupeesToPaise(v)), 'Enter the price in rupees, e.g. 24999 or 24,999.50')
  .refine((v) => {
    const paise = rupeesToPaise(v)
    return Number.isNaN(paise) || paise > 0 // NaN is reported by the rule above
  }, 'The price must be more than ₹0')

/** An image chosen in the file input, checked for type and size. */
function imageRule(required: boolean) {
  return z.custom<FileList | undefined>().superRefine((files, ctx) => {
    const file = files?.[0]
    if (!file) {
      if (required) ctx.addIssue({ code: 'custom', message: 'Add a photo of the product' })
      return
    }
    if (!IMAGE_TYPES.includes(file.type)) ctx.addIssue({ code: 'custom', message: 'Use a JPEG, PNG or WebP image' })
    else if (file.size > MAX_IMAGE_MB * 1024 * 1024) ctx.addIssue({ code: 'custom', message: `The image must be ${MAX_IMAGE_MB} MB or smaller` })
  })
}

/** New products need an image; when editing, a new image is optional. */
export function productSchema({ requireImage }: { requireImage: boolean }) {
  return z.object({
    productName: z.string().trim().min(1, 'Enter a product name').max(200, 'Name must be at most 200 characters'),
    description: z.string().trim().max(5000, 'Description must be at most 5000 characters'),
    price,
    categoryId: z.string().min(1, 'Choose a category'),
    brandId: z.string(),
    image: imageRule(requireImage),
  })
}

export type ProductValues = z.infer<ReturnType<typeof productSchema>>

export const nameSchema = (label: string) =>
  z.object({ name: z.string().trim().min(1, `Enter a ${label.toLowerCase()} name`).max(100, `${label} name must be at most 100 characters`) })
