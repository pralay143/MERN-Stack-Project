import { errorMessage } from '@/api/client'
import type { User } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Alert, Badge } from '@/components/ui/misc'
import { useCurrentUser } from '@/features/auth/hooks'
import { AdminTable } from './AdminTable'
import { useDeleteUser, useRoles, useUpdateUserRole, useUsers } from './hooks'

const roleHelp: Record<string, string> = {
  Customer: 'shops',
  Vendor: 'sells products',
  Admin: 'runs the store',
}

export function UsersPage() {
  const { user: me } = useCurrentUser()
  const users = useUsers()
  const roles = useRoles()
  const changeRole = useUpdateUserRole()
  const remove = useDeleteUser()

  function confirmDelete(user: User) {
    if (window.confirm(`Delete ${user.name}’s account (${user.email})? This can’t be undone.`)) remove.mutate(user._id)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Users</h1>
        <p className="mt-1 text-sm text-muted">
          To make someone a seller, change their role to Vendor. They’ll see the seller dashboard next time they load the site.
        </p>
      </div>
      {(changeRole.isError || remove.isError) && <Alert>{errorMessage(changeRole.error ?? remove.error)}</Alert>}

      <AdminTable query={users} empty="No users yet" columns={['Name', 'Email', 'Role', '']}>
        {(items) =>
          items.map((u) => {
            const isMe = u._id === me?._id
            return (
              <tr key={u._id}>
                <td className="px-4 py-3 font-medium">
                  {u.name} {isMe && <Badge>You</Badge>}
                </td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3">
                  {/* Admins can't change their own role here, so the store can't be left without one by accident. */}
                  <label className="sr-only" htmlFor={`role-${u._id}`}>
                    Role for {u.name}
                  </label>
                  <select
                    id={`role-${u._id}`}
                    value={u.role?._id ?? ''}
                    disabled={isMe || !roles.data || (changeRole.isPending && changeRole.variables?.id === u._id)}
                    onChange={(e) => changeRole.mutate({ id: u._id, role: e.target.value })}
                    className="h-9 rounded-lg border border-line bg-surface px-2 text-sm disabled:bg-sand"
                  >
                    {!u.role && <option value="">No role</option>}
                    {(roles.data ?? (u.role ? [u.role] : [])).map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({roleHelp[r.name] ?? r.name})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {!isMe && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger"
                        loading={remove.isPending && remove.variables === u._id}
                        onClick={() => confirmDelete(u)}
                        aria-label={`Delete ${u.name}`}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })
        }
      </AdminTable>
    </div>
  )
}
