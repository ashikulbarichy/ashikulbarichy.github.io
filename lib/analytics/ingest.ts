import { SUPABASE_URL } from '@/lib/supabase/config'

/**
 * Write path for analytics.
 *
 * Talks to Supabase's REST endpoint with plain `fetch` rather than
 * @supabase/supabase-js. Two reasons: it keeps the Edge bundle small, and the
 * only operations needed are one insert and one upsert, so the SDK buys
 * nothing here.
 *
 * Uses the SERVICE ROLE key, which bypasses RLS. That is intentional — the
 * tables have no insert policy at all — and it is why nothing in this file may
 * ever be imported from a client component.
 */

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const isIngestConfigured = Boolean(SUPABASE_URL && SERVICE_KEY)

function headers(extra: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    ...extra,
  }
}

async function rest(
  path: string,
  init: RequestInit & { headers?: Record<string, string> }
): Promise<Response | null> {
  if (!isIngestConfigured) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: headers(init.headers),
      cache: 'no-store',
    })
    if (!res.ok) {
      // Analytics must never break a page render. Log and move on.
      const body = await res.text().catch(() => '')
      console.error(`[analytics] ${init.method} ${path} -> ${res.status}: ${body.slice(0, 300)}`)
      return null
    }
    return res
  } catch (err) {
    console.error('[analytics] request failed:', err)
    return null
  }
}

export interface SessionUpsert {
  id: string
  visitor_hash?: string | null
  entry_path?: string
  current_path?: string
  exit_path?: string
  referrer?: string | null
  referrer_group?: string
  referrer_source?: string
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  country?: string | null
  region?: string | null
  city?: string | null
  latitude?: number | null
  longitude?: number | null
  timezone?: string | null
  device_type?: string
  os?: string | null
  os_version?: string | null
  browser?: string | null
  browser_version?: string | null
  screen_w?: number | null
  screen_h?: number | null
  viewport_w?: number | null
  viewport_h?: number | null
  language?: string | null
  color_scheme?: string | null
  is_bot?: boolean
  bot_name?: string | null
  last_seen_at?: string
}

/**
 * Create the session if new, otherwise merge in whatever changed.
 *
 * `merge-duplicates` means a heartbeat can send only `last_seen_at` and
 * `current_path` without clobbering the geo and device columns recorded on the
 * first request.
 */
export async function upsertSession(row: SessionUpsert): Promise<void> {
  await rest('sessions?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ ...row, last_seen_at: row.last_seen_at ?? new Date().toISOString() }),
  })
}

export interface EventInsert {
  session_id?: string | null
  event_type: string
  path: string
  country?: string | null
  city?: string | null
  device_type?: string | null
  is_bot?: boolean
  bot_name?: string | null
  meta?: Record<string, unknown>
}

export async function insertEvents(rows: EventInsert[]): Promise<void> {
  if (!rows.length) return
  await rest('events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(rows),
  })
}

/** Bump pageview_count and engaged_ms without a read-modify-write race. */
export async function incrementSession(
  sessionId: string,
  fields: { pageviews?: number; engagedMs?: number }
): Promise<void> {
  if (!isIngestConfigured) return
  // PostgREST cannot express `col = col + n`, so this goes through the
  // sam_bump_session RPC defined in supabase/migrations/0001_analytics.sql.
  await rest('rpc/sam_bump_session', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      p_session_id: sessionId,
      p_pageviews: fields.pageviews ?? 0,
      p_engaged_ms: fields.engagedMs ?? 0,
    }),
  })
}
