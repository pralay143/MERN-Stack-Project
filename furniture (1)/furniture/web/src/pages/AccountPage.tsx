import { Container } from '@/components/ui/misc'
import { AddressBook } from '@/features/addresses/AddressBook'
import { useCurrentUser } from '@/features/auth/hooks'

/** The logged-in user's details. Only rendered inside RequireAuth. */
export function AccountPage() {
  const { user } = useCurrentUser()
  if (!user) return null

  const rows: Array<[string, string]> = [
    ['Name', user.name],
    ['Email', user.email],
    ['Phone', user.contactNum || '—'],
    ['Account type', user.role?.name ?? '—'],
    ['Member since', new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })],
  ]

  return (
    <Container className="py-12">
      <h1 className="text-4xl">Your account</h1>
      <p className="mt-2 text-muted">Your details and delivery addresses. Orders will appear here too.</p>
      <dl className="mt-8 max-w-xl divide-y divide-line rounded-card border border-line bg-surface">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-3 gap-4 px-6 py-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="col-span-2 text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-12">
        <AddressBook defaultName={user.name} />
      </div>
    </Container>
  )
}
