import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SAM_ALLOWED_EMAIL } from '@/lib/supabase/config'
import { fetchStats } from '@/lib/sam/stats'

/**
 * Every dashboard panel in one response.
 *
 * One round trip rather than nine, because the client refetches this whenever
 * Realtime reports a new event — so the cost of a refresh matters.
 *
 * Auth is re-checked here. This is a route handler, so the middleware /sam
 * matcher does not cover it; without this check the anon key plus a guessed
 * URL would read the whole dataset.
 */
export const dynamic = 'force-dynamic'

const ALLOWED_DAYS = new Set([1, 7, 30, 90])

export async function GET(request: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })

  if (SAM_ALLOWED_EMAIL && (user.email ?? '').toLowerCase() !== SAM_ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // Whitelisted, so a crafted ?days= cannot turn into an unbounded scan.
  const requested = Number(request.nextUrl.searchParams.get('days'))
  const days = ALLOWED_DAYS.has(requested) ? requested : 30

  const payload = await fetchStats(supabase, days)
  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
}
