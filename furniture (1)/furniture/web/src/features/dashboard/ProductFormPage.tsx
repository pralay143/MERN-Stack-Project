import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { assetUrl, errorMessage, errorStatus } from '@/api/client'
import type { Product } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { Alert, Skeleton } from '@/components/ui/misc'
import { rupeesToPaise } from '@/lib/money'
import { applyServerErrors } from '@/features/auth/applyServerErrors'
import { hasRole, useCurrentUser } from '@/features/auth/hooks'
import { useBrands, useCategories, useProduct } from '@/features/products/hooks'
import { useCreateProduct, useUpdateProduct } from './hooks'
import { IMAGE_TYPES, MAX_IMAGE_MB, productSchema, type ProductValues } from './schemas'

const BACK = '/dashboard/products'

/** /dashboard/products/new */
export function NewProductPage() {
  return <ProductForm />
}

/** /dashboard/products/:id/edit — loads the product, then shows the form. */
export function EditProductPage() {
  const { id = '' } = useParams()
  const { user } = useCurrentUser()
  const product = useProduct(id)

  if (product.isPending) {
    return (
      <div role="status" className="flex max-w-2xl flex-col gap-4">
        <span className="sr-only">Loading product…</span>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }
  if (product.isError) {
    const status = errorStatus(product.error)
    return (
      <div className="flex max-w-2xl flex-col items-start gap-4">
        <Alert className="w-full">
          {status === 400 || status === 404 ? 'That product doesn’t exist any more.' : errorMessage(product.error)}
        </Alert>
        <Link to={BACK} className={buttonClasses({ variant: 'secondary' })}>
          Back to products
        </Link>
      </div>
    )
  }
  // The API refuses too; this saves filling in a form that can't be saved.
  if (!hasRole(user, 'Admin') && product.data.user !== user?._id) {
    return <Alert>You can only edit your own products.</Alert>
  }
  return <ProductForm product={product.data} />
}

function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate()
  const categories = useCategories()
  const brands = useBrands()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const save = product ? update : create
  const schema = useMemo(() => productSchema({ requireImage: !product }), [product])

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<ProductValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productName: product?.productName ?? '',
      description: product?.description ?? '',
      price: product ? String(product.price / 100) : '',
      categoryId: product?.categoryId?._id ?? '',
      brandId: product?.brandId?._id ?? '',
    },
  })

  const preview = useFilePreview(useWatch({ control, name: 'image' })?.[0])
  const imageUrl = preview ?? assetUrl(product?.file?.url)

  function onSubmit(values: ProductValues) {
    const input = {
      productName: values.productName,
      description: values.description,
      price: rupeesToPaise(values.price),
      categoryId: values.categoryId,
      brandId: values.brandId || undefined,
      image: values.image?.[0],
    }
    const options = {
      onSuccess: () =>
        navigate(BACK, { state: { notice: product ? `Saved “${input.productName}”.` : `Added “${input.productName}” to the shop.` } }),
      onError: (error: unknown) => applyServerErrors(error, setError, ['productName', 'description', 'price', 'categoryId', 'brandId']),
    }
    if (product) update.mutate({ id: product._id, ...input }, options)
    else create.mutate({ ...input, image: input.image as File }, options)
  }

  const showAlert = save.isError && Object.keys(errors).length === 0
  // A product's current category or brand stays selectable even if hidden.
  const categoryOptions = categories.data?.filter((c) => c.isActive || c._id === product?.categoryId?._id) ?? []

  return (
    <div className="max-w-2xl">
      <Link to={BACK} className="text-sm text-muted hover:text-walnut">
        ← Products
      </Link>
      <h1 className="mt-2 text-3xl">{product ? `Edit ${product.productName}` : 'Add a product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-5">
        {showAlert && <Alert>{errorMessage(save.error)}</Alert>}
        <TextField label="Name" error={errors.productName?.message} {...register('productName')} />
        <TextAreaField
          label="Description (optional)"
          hint="Materials, size, finish: what a shopper needs to decide."
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField label="Price (₹)" inputMode="decimal" placeholder="24999" error={errors.price?.message} {...register('price')} />
          <SelectField label="Category" disabled={!categories.data} error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">Choose…</option>
            {categoryOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.categoryName}
              </option>
            ))}
          </SelectField>
          {/* The API can't remove a brand once set, so "No brand" is only offered when there isn't one. */}
          <SelectField label="Brand" disabled={!brands.data} error={errors.brandId?.message} {...register('brandId')}>
            {!product?.brandId && <option value="">No brand</option>}
            {brands.data?.map((b) => (
              <option key={b._id} value={b._id}>
                {b.brandName}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="product-image" className="text-sm font-medium">
            {product ? 'Photo (choose a file to replace it)' : 'Photo'}
          </label>
          <div className="flex items-center gap-4">
            <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-line bg-sand">
              {imageUrl && <img src={imageUrl} alt="Selected product photo" className="size-full object-cover" />}
            </div>
            <input
              id="product-image"
              type="file"
              accept={IMAGE_TYPES.join(',')}
              aria-invalid={errors.image ? true : undefined}
              aria-describedby="product-image-help"
              className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-walnut-light file:px-4 file:py-2 file:font-medium file:text-walnut-dark hover:file:bg-sand"
              {...register('image')}
            />
          </div>
          <p id="product-image-help" className={errors.image ? 'text-sm text-danger' : 'text-sm text-muted'}>
            {errors.image?.message ?? `JPEG, PNG or WebP, up to ${MAX_IMAGE_MB} MB.`}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={save.isPending}>
            {product ? 'Save changes' : 'Add product'}
          </Button>
          <Link to={BACK} className={buttonClasses({ variant: 'ghost' })}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

/** An object URL for previewing a chosen file, released when it changes. */
function useFilePreview(file: File | undefined): string | undefined {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file])
  useEffect(() => {
    if (url) return () => URL.revokeObjectURL(url)
  }, [url])
  return url
}
