import { type NextRequest, NextResponse, userAgent } from 'next/server'
import {
  classifyBot,
  classifyReferrer,
  isIgnoredPath,
  normaliseDeviceType,
  visitorHash,
} from '@/lib/analytics/classify'
import {
  incrementSession,
  insertEvents,
  isIngestConfigured,
  upsertSession,
} from '@/lib/analytics/ingest'

/**
 * Human analytics collector.
 *
 * Runs on the Edge so it is close to the visitor and cheap. It reads Vercel's
 * geo headers off THIS request — the beacon comes from the same browser and IP
 * as the pageview, so geolocation is just as accurate here as it would be in
 * middleware, without putting a database write in the page's critical path.
 *
 * Deliberately permissive about failure: every error path still returns 204,
 * because a broken analytics endpoint must never surface to a visitor or
 * retry-storm the browser.
 */
export const runtime = 'edge'

const SALT = process.env.ANALYTICS_SALT ?? ''
const MAX_BODY = 8 * 1024

type EventType =
  | 'pageview'
  | 'heartbeat'
  | 'cv_download'
  | 'email_click'
  | 'outbound_click'
  | 'project_view'
  | 'faq_open'
  | 'scroll_depth'

const ALLOWED: ReadonlySet<string> = new Set<EventType>([
  'pageview',
  'heartbeat',
  'cv_download',
  'email_click',
  'outbound_click',
  'project_view',
  'faq_open',
  'scroll_depth',
])

interface Payload {
  sid?: string
  type?: string
  path?: string
  referrer?: string | null
  screen_w?: number
  screen_h?: number
  viewport_w?: number
  viewport_h?: number
  color_scheme?: string
  engaged_ms?: number
  meta?: Record<string, unknown>
}

const noContent = () => new NextResponse(null, { status: 204 })

export async function POST(request: NextRequest) {
  if (!isIngestConfigured) return noContent()

  let body: Payload
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY) return noContent()
    body = JSON.parse(raw)
  } catch {
    return noContent()
  }

  const type = body.type ?? 'pageview'
  if (!ALLOWED.has(type)) return noContent()

  // A session id must be a real UUID — it goes straight into a uuid column.
  const sid = body.sid
  if (!sid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sid)) {
    return noContent()
  }

  const path = typeof body.path === 'string' ? body.path.slice(0, 512) : '/'
  if (isIgnoredPath(path)) return noContent()

  const ua = request.headers.get('user-agent')
  const bot = classifyBot(ua)

  // A bot running JavaScript (headless Chrome, Lighthouse) still gets flagged,
  // so it can be filtered out of the human numbers rather than inflating them.
  const geo = request.geo ?? {}
  const parsed = userAgent(request)
  const city = geo.city ? decodeURIComponent(geo.city) : null

  try {
    if (type === 'heartbeat') {
      // Cheapest possible path: bump the counters, touch last_seen_at, and
      // move the live view to the current page. No event row — heartbeats
      // every 15s would swamp the events table for no analytical value.
      await Promise.all([
        upsertSession({ id: sid, current_path: path, exit_path: path }),
        incrementSession(sid, { engagedMs: clampMs(body.engaged_ms) }),
      ])
      return noContent()
    }

    if (type === 'pageview') {
      const referrer = classifyReferrer(body.referrer, request.nextUrl.hostname)
      const hash = await visitorHash(request.ip, ua, SALT)
      const url = new URL(request.url)

      await upsertSession({
        id: sid,
        visitor_hash: hash,
        entry_path: path,
        current_path: path,
        exit_path: path,
        referrer: referrer.raw,
        referrer_group: referrer.group,
        referrer_source: referrer.source,
        utm_source: url.searchParams.get('utm_source'),
        utm_medium: url.searchParams.get('utm_medium'),
        utm_campaign: url.searchParams.get('utm_campaign'),
        country: geo.country ?? null,
        region: geo.region ?? null,
        city,
        latitude: geo.latitude ? Number(geo.latitude) : null,
        longitude: geo.longitude ? Number(geo.longitude) : null,
        timezone: request.headers.get('x-vercel-ip-timezone'),
        device_type: normaliseDeviceType(parsed.device?.type),
        os: parsed.os?.name ?? null,
        os_version: parsed.os?.version ?? null,
        browser: parsed.browser?.name ?? null,
        browser_version: parsed.browser?.version ?? null,
        screen_w: clampInt(body.screen_w),
        screen_h: clampInt(body.screen_h),
        viewport_w: clampInt(body.viewport_w),
        viewport_h: clampInt(body.viewport_h),
        language: request.headers.get('accept-language')?.split(',')[0] ?? null,
        color_scheme: body.color_scheme === 'dark' ? 'dark' : 'light',
        is_bot: bot.isBot,
        bot_name: bot.botName,
      })

      await Promise.all([
        insertEvents([
          {
            session_id: sid,
            event_type: 'pageview',
            path,
            country: geo.country ?? null,
            city,
            device_type: normaliseDeviceType(parsed.device?.type),
            is_bot: bot.isBot,
            bot_name: bot.botName,
            meta: {
              referrer_group: referrer.group,
              referrer_source: referrer.source,
            },
          },
        ]),
        incrementSession(sid, { pageviews: 1 }),
      ])
      return noContent()
    }

    // Everything else is a conversion or interaction event.
    await insertEvents([
      {
        session_id: sid,
        event_type: type,
        path,
        country: geo.country ?? null,
        city,
        device_type: normaliseDeviceType(parsed.device?.type),
        is_bot: bot.isBot,
        bot_name: bot.botName,
        meta: sanitiseMeta(body.meta),
      },
    ])
    return noContent()
  } catch (err) {
    console.error('[analytics] collect failed:', err)
    return noContent()
  }
}

/** Reject anything that is not a sane pixel dimension. */
function clampInt(n: unknown): number | null {
  if (typeof n !== 'number' || !Number.isFinite(n)) return null
  const v = Math.round(n)
  return v > 0 && v < 30000 ? v : null
}

/** Cap a heartbeat's contribution so a tampered payload cannot skew averages. */
function clampMs(n: unknown): number {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return 0
  return Math.min(Math.round(n), 120_000)
}

/**
 * The meta column is jsonb written from an untrusted client, so it is bounded
 * in both key count and value size before it goes anywhere near the database.
 */
function sanitiseMeta(meta: unknown): Record<string, unknown> {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return {}
  const out: Record<string, unknown> = {}
  let n = 0
  for (const [k, v] of Object.entries(meta as Record<string, unknown>)) {
    if (n++ >= 12) break
    const key = k.slice(0, 40)
    if (typeof v === 'string') out[key] = v.slice(0, 500)
    else if (typeof v === 'number' && Number.isFinite(v)) out[key] = v
    else if (typeof v === 'boolean') out[key] = v
  }
  return out
}
