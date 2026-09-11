import { Compass } from 'lucide-react'

import { PageContainer } from '@/components/layout/PageContainer'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'

export default function NotFound() {
  return (
    <PageContainer width="narrow">
      <EmptyState
        icon={<Compass className="size-5" aria-hidden />}
        title="We could not find that page"
        description="The link may be out of date. Head back to your campus dashboard and start again."
        action={<ButtonLink to="/app">Back to Home</ButtonLink>}
        className="mt-10"
      />
    </PageContainer>
  )
}
