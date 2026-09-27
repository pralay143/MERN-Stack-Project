import { Button } from '@/components/ui/Button'
import { SelectField, TextField } from '@/components/ui/Field'
import { Alert, Badge, Container, EmptyState, Skeleton } from '@/components/ui/misc'
import { Spinner } from '@/components/ui/Spinner'

// Temporary preview of the design system; replaced by the router later.
export default function App() {
  return (
    <Container className="flex flex-col gap-12 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-widest text-terracotta uppercase">Design system</p>
        <h1 className="text-5xl">Furniture for every room</h1>
        <p className="max-w-xl text-lg text-muted">Warm, minimal and made to last. Handpicked pieces from independent makers.</p>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        <Button>Add to cart</Button>
        <Button variant="secondary">Save for later</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">Delete</Button>
        <Button loading>Saving</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Badge>New</Badge>
        <Badge tone="accent">20% off</Badge>
        <Spinner label="Loading products" />
      </section>

      <section className="grid max-w-2xl gap-5 sm:grid-cols-2">
        <TextField label="Email" type="email" placeholder="you@example.com" hint="We never share your email." />
        <TextField label="Password" type="password" error="Password must be at least 8 characters" />
        <SelectField label="Category" defaultValue="">
          <option value="" disabled>
            Choose a category
          </option>
          <option>Sofas</option>
          <option>Beds</option>
        </SelectField>
      </section>

      <Alert>Invalid email or password.</Alert>

      <section className="grid gap-6 sm:grid-cols-3">
        <article className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="aspect-[4/3] bg-sand" />
          <div className="flex flex-col gap-1 p-5">
            <p className="text-sm text-muted">Sofas</p>
            <h3 className="text-lg">Chesterfield Three-Seater</h3>
            <p className="font-medium">₹25,500</p>
          </div>
        </article>
        <Skeleton className="h-72" />
        <EmptyState title="Your cart is empty" action={<Button variant="secondary">Browse furniture</Button>}>
          Find something you love and it will show up here.
        </EmptyState>
      </section>
    </Container>
  )
}
