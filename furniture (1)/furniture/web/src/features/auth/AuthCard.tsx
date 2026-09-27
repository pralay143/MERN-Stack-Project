import type { ReactNode } from 'react'
import { Container } from '@/components/ui/misc'

/** Centred card used by the login and sign-up pages. */
export function AuthCard({ title, intro, children, footer }: { title: string; intro: string; children: ReactNode; footer: ReactNode }) {
  return (
    <Container className="flex justify-center py-16">
      <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl">{title}</h1>
        <p className="mt-2 text-muted">{intro}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">{footer}</p>
      </div>
    </Container>
  )
}
