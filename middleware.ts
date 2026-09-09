import { NextResponse, type NextRequest, userAgent } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  SAM_LOGIN_PATH,
  isSupabaseConfigured,
} from '@/lib/supabase/config'
import {
  classifyBot,
  classifyReferrer,
  isIgnoredPath,
  normaliseDeviceType,
  visitorHash,
} from '@/lib/analytics/classify'
import { insertEvents, isIngestConfigured, upsertSession } from '@/lib/analytics/ingest'

/**
 * Middleware does two unrelated jobs.
 *
 * 1. Gates /sam behind a Supabase session, and keeps that session fresh.
 *
 * 2. Records crawler visits. This has to happen server-side because crawlers
 *    do not execute JavaScript — the client beacon that tracks humans is
 *    invisible to them, and crawler activity is the whole point of the SEO
 *    panel. Humans are deliberately NOT written here: their pageview arrives
 *    via /api/collect, so a real visitor never waits on a database insert.
 *
 * The bot insert is awaited, which adds roughly 50-150ms to a crawler's
 * request. That is an acceptable trade: bots do not care, and it avoids
 * relying on fire-and-forget fetches that the Edge runtime may cancel once the
 * response is returned.
 */

const SALT = process.env.ANALYTICS_SALT ?? ''

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/sam' || pathname.startsWith('/sam/')) {
    return guardSam(request)
  }

  return collectBot(request)
}

// ---------------------------------------------------------------------------
// /sam auth gate
// ---------------------------------------------------------------------------

async function guardSam(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // Never let the dashboard be indexed, whatever the page itself declares.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')

  if (!isSupabaseConfigured) {
    // Fail closed. An unconfigured Supabase must not mean an open dashboard.
    if (pathname !== SAM_LOGIN_PATH) {
      const url = request.nextUrl.clone()
      url.pathname = SAM_LOGIN_PATH
      url.searchParams.set('error', 'not_configured')
      return NextResponse.redirect(url)
    }
    return response
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({ request })
        response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options })
        response = NextResponse.next({ request })
        response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  // getUser() revalidates the token against Supabase rather than trusting the
  // cookie's contents, which is the difference that matters for a guard.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && pathname !== SAM_LOGIN_PATH) {
    const url = request.nextUrl.clone()
    url.pathname = SAM_LOGIN_PATH
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && pathname === SAM_LOGIN_PATH) {
    const url = request.nextUrl.clone()
    url.pathname = '/sam'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

// ---------------------------------------------------------------------------
// Crawler collection
// ---------------------------------------------------------------------------

async function collectBot(request: NextRequest): Promise<NextResponse> {
  const next = NextResponse.next()
  const { pathname, searchParams } = request.nextUrl

  if (!isIngestConfigured || isIgnoredPath(pathname)) return next

  const ua = request.headers.get('user-agent')
  const bot = classifyBot(ua)

  // Humans are handled by the beacon; leaving early keeps their latency at zero.
  if (!bot.isBot) return next

  const geo = request.geo ?? {}
  const parsed = userAgent(request)
  const referrer = classifyReferrer(
    request.headers.get('referer'),
    request.nextUrl.hostname
  )

  const sessionId = crypto.randomUUID()
  const hash = await visitorHash(request.ip, ua, SALT)
  const city = geo.city ? decodeURIComponent(geo.city) : null

  try {
    await upsertSession({
      id: sessionId,
      visitor_hash: hash,
      entry_path: pathname,
      current_path: pathname,
      referrer: referrer.raw,
      referrer_group: referrer.group,
      referrer_source: referrer.source,
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      country: geo.country ?? null,
      region: geo.region ?? null,
      city,
      latitude: geo.latitude ? Number(geo.latitude) : null,
      longitude: geo.longitude ? Number(geo.longitude) : null,
      timezone: request.headers.get('x-vercel-ip-timezone'),
      device_type: normaliseDeviceType(parsed.device?.type),
      os: parsed.os?.name ?? null,
      browser: parsed.browser?.name ?? null,
      language: request.headers.get('accept-language')?.split(',')[0] ?? null,
      is_bot: true,
      bot_name: bot.botName,
    })

    await insertEvents([
      {
        session_id: sessionId,
        event_type: 'crawler_hit',
        path: pathname,
        country: geo.country ?? null,
        city,
        device_type: 'bot',
        is_bot: true,
        bot_name: bot.botName,
        meta: {
          user_agent: ua?.slice(0, 400) ?? null,
          is_ai_crawler: bot.isAiCrawler,
        },
      },
    ])
  } catch (err) {
    // A failed analytics write must never turn into a failed page.
    console.error('[analytics] crawler collect failed:', err)
  }

  return next
}

export const config = {
  /**
   * Run on document requests and the SEO text routes only.
   *
   * Everything with a file extension, plus _next internals and the collector
   * API, is excluded — otherwise middleware would fire on every image and
   * chunk, which costs invocations and records nothing useful.
   */
  matcher: [
    '/((?!_next/static|_next/image|api/collect|favicon\\.|apple-touch-icon|img/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff|woff2|ttf|otf|eot|mp4|webm|pdf)$).*)',
  ],
}
