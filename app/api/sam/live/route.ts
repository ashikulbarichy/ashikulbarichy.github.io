import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SAM_ALLOWED_EMAIL } from '@/lib/supabase/config'

/**
 * Live viewers, polled by the dashboard every few seconds.
 *
 * Polling rather than a Realtime subscription: the sessions table takes a
 * write every 15s per visitor, so a Realtime channel on it would be noisy and
 * burn quota to deliver a number that only needs to be a few seconds fresh.
 *
 * Auth is re-checked here. This is a route handler, so middleware's /sam
 * matcher does not cover it.
 */
export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })

  if (SAM_ALLOWED_EMAIL && (user.email ?? '').toLowerCase() !== SAM_ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.rpc('sam_live_viewers', { window_seconds: 30 })

  if (error) {
    return NextResponse.json({ error: error.message, viewers: [] }, { status: 200 })
  }

  return NextResponse.json(
    { count: data?.length ?? 0, viewers: data ?? [] },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
