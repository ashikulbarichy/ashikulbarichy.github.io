import { requireAdmin } from '@/lib/supabase/admin-guard'
import { fetchStats } from '@/lib/sam/stats'
import Dashboard from '@/components/sam/Dashboard'

/**
 * Dashboard entry point.
 *
 * The initial payload is fetched on the server so the first paint has real
 * numbers rather than a spinner. From there the client takes over: Supabase
 * Realtime signals that something changed, and the client refetches
 * /api/sam/stats — the same `fetchStats` used here, so there is one definition
 * of every metric rather than two that can drift.
 */
export const dynamic = 'force-dynamic'

export default async function SamPage() {
  const { supabase, user } = await requireAdmin()
  const initial = await fetchStats(supabase, 30)

  return <Dashboard initial={initial} email={user.email} />
}
