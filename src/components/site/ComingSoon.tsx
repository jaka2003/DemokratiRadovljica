import { Construction } from 'lucide-react'
import { Container } from '@/components/site/Container'
import { Button } from '@/components/ui/Button'

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <Container className="py-24 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cloud text-teal">
        <Construction className="h-8 w-8" strokeWidth={1.6} />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        {description ?? 'Ta stran je v pripravi in bo objavljena v naslednji fazi izdelave.'}
      </p>
      <div className="mt-8 flex justify-center">
        <Button href="/" variant="outline">
          Nazaj na domačo stran
        </Button>
      </div>
    </Container>
  )
}
