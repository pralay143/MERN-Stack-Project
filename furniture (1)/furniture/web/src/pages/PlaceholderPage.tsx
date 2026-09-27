import { Container } from '@/components/ui/misc'

/** Temporary stand-in until the real page exists. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Container className="py-16">
      <h1 className="text-4xl">{title}</h1>
    </Container>
  )
}
