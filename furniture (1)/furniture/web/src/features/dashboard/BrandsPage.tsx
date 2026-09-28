import { useState } from 'react'
import { errorMessage } from '@/api/client'
import type { Brand, Category } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { useBrands, useCategories } from '@/features/products/hooks'
import { AdminTable } from './AdminTable'
import { useCreateBrand, useDeleteBrand, useUpdateBrand } from './hooks'
import { AddByNameForm, EditableName } from './NameEditing'

// The list endpoint populates the category; a create or update response may not.
const categoryName = (value: Brand['categoryId'], categories: Category[] = []) =>
  typeof value === 'string' ? categories.find((c) => c._id === value)?.categoryName : value?.categoryName

export function BrandsPage() {
  const brands = useBrands()
  const categories = useCategories()
  const create = useCreateBrand()
  const update = useUpdateBrand()
  const remove = useDeleteBrand()
  const [newCategory, setNewCategory] = useState('')

  function confirmDelete(brand: Brand) {
    if (window.confirm(`Delete “${brand.brandName}”? Its products will be shown without a brand.`)) remove.mutate(brand._id)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl">Brands</h1>

      <AddByNameForm
        label="Brand"
        onAdd={async (brandName) => {
          await create.mutateAsync({ brandName, categoryId: newCategory || undefined })
          setNewCategory('')
        }}
        extra={
          <SelectField label="Main category (optional)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            <option value="">None</option>
            {categories.data?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.categoryName}
              </option>
            ))}
          </SelectField>
        }
      />
      {(update.isError || remove.isError) && <Alert>{errorMessage(update.error ?? remove.error)}</Alert>}

      <AdminTable query={brands} empty="No brands yet" columns={['Name', 'Main category', '']}>
        {(items) =>
          items.map((b) => (
            <tr key={b._id}>
              <td className="px-4 py-3">
                <EditableName name={b.brandName} label="Brand" onSave={(brandName) => update.mutateAsync({ id: b._id, brandName })} />
              </td>
              <td className="px-4 py-3 text-muted">{categoryName(b.categoryId, categories.data) ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    loading={remove.isPending && remove.variables === b._id}
                    onClick={() => confirmDelete(b)}
                    aria-label={`Delete ${b.brandName}`}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))
        }
      </AdminTable>
    </div>
  )
}
