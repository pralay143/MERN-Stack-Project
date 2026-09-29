import { errorMessage } from '@/api/client'
import type { Category } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Alert, Badge } from '@/components/ui/misc'
import { useCategories } from '@/features/products/hooks'
import { AdminTable } from './AdminTable'
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from './hooks'
import { AddByNameForm, EditableName } from './NameEditing'

export function CategoriesPage() {
  const categories = useCategories()
  const create = useCreateCategory()
  const update = useUpdateCategory()
  const remove = useDeleteCategory()

  function confirmDelete(category: Category) {
    const message = `Delete “${category.categoryName}”? Products in it will be left without a category. To take it out of the shop but keep it, hide it instead.`
    if (window.confirm(message)) remove.mutate(category._id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-muted">A hidden category stays on its products, but isn’t offered as a shop filter or to sellers for new products.</p>
      </div>

      <AddByNameForm label="Category" onAdd={(categoryName) => create.mutateAsync({ categoryName })} />
      {(update.isError || remove.isError) && <Alert>{errorMessage(update.error ?? remove.error)}</Alert>}

      <AdminTable query={categories} empty="No categories yet" columns={['Name', 'Status', '']}>
        {(items) =>
          items.map((c) => (
            <tr key={c._id}>
              <td className="px-4 py-3">
                <EditableName
                  name={c.categoryName}
                  label="Category"
                  onSave={(categoryName) => update.mutateAsync({ id: c._id, categoryName })}
                />
              </td>
              <td className="px-4 py-3">{c.isActive ? <Badge>In the shop</Badge> : <span className="text-muted">Hidden</span>}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={update.isPending && update.variables?.id === c._id && update.variables.isActive !== undefined}
                    onClick={() => update.mutate({ id: c._id, isActive: !c.isActive })}
                    aria-label={`${c.isActive ? 'Hide' : 'Show'} ${c.categoryName}`}
                  >
                    {c.isActive ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    loading={remove.isPending && remove.variables === c._id}
                    onClick={() => confirmDelete(c)}
                    aria-label={`Delete ${c.categoryName}`}
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
