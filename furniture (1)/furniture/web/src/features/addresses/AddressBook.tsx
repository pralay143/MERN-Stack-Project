import { useState } from 'react'
import { errorMessage } from '@/api/client'
import type { Address } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Alert, Skeleton } from '@/components/ui/misc'
import { AddressForm, AddressLines } from './AddressForm'
import { useAddresses, useDeleteAddress, useUpdateAddress } from './hooks'

/** The account page's saved addresses: add, make default, delete. */
export function AddressBook({ defaultName }: { defaultName?: string }) {
  const addresses = useAddresses()
  const makeDefault = useUpdateAddress()
  const remove = useDeleteAddress()
  const [adding, setAdding] = useState(false)
  const failed = [makeDefault, remove].find((m) => m.isError)

  function confirmDelete(address: Address) {
    if (window.confirm(`Delete the address for ${address.fullName}, ${address.city}?`)) remove.mutate(address._id)
  }

  const saved = addresses.data ?? []

  return (
    <section aria-labelledby="addresses-heading" className="flex max-w-xl flex-col gap-4">
      <h2 id="addresses-heading" className="text-2xl">
        Saved addresses
      </h2>
      {failed && <Alert>{errorMessage(failed.error)}</Alert>}
      {addresses.isPending ? (
        <Skeleton className="h-28" />
      ) : addresses.isError ? (
        <Alert>{errorMessage(addresses.error, 'We couldn’t load your addresses.')}</Alert>
      ) : (
        <>
          {saved.length === 0 && !adding && <p className="text-muted">No saved addresses yet. You can add one here or at checkout.</p>}
          <ul className="flex flex-col gap-3">
            {saved.map((address) => (
              <li key={address._id} className="flex flex-wrap items-start gap-4 rounded-card border border-line bg-surface p-4">
                <AddressLines address={address} />
                <div className="ml-auto flex items-center gap-2">
                  {address.isDefault ? (
                    <span className="text-xs font-medium text-walnut">Default</span>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => makeDefault.mutate({ id: address._id, isDefault: true })}>
                      Make default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" aria-label={`Delete the address for ${address.fullName}, ${address.city}`} onClick={() => confirmDelete(address)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {adding ? (
            <div className="rounded-card border border-line bg-surface p-5">
              <AddressForm defaultName={defaultName} canBeDefault={saved.length > 0} onCancel={() => setAdding(false)} onSaved={() => setAdding(false)} />
            </div>
          ) : (
            <Button variant="secondary" className="self-start" onClick={() => setAdding(true)}>
              Add an address
            </Button>
          )}
        </>
      )}
    </section>
  )
}
