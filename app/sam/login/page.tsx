import { Suspense } from 'react'
import LoginForm from '@/components/sam/LoginForm'

/**
 * The form reads `useSearchParams` (for `?next=` and `?error=`), which Next
 * cannot resolve at build time. Rendering this route on demand and wrapping
 * the form in Suspense keeps the build clean — and a login page has no reason
 * to be statically prerendered anyway.
 */
export const dynamic = 'force-dynamic'

export default function SamLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
