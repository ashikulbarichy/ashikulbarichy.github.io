'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Client beacon.
 *
 * Sends a pageview on mount and on every client-side navigation, a heartbeat
 * every 15s while the tab is visible, and conversion events for the handful of
 * interactions that actually matter for a job search.
 *
 * No cookies and no localStorage. The session id lives in sessionStorage, so
 * it dies with the tab; cross-day identity comes from the server-side rotating
 * hash instead. That combination is what lets the site run with no consent
 * banner.
 */

const HEARTBEAT_MS = 15_000
const SESSION_KEY = 'sam_sid'

type EventType =
  | 'pageview'
  | 'heartbeat'
  | 'cv_download'
  | 'email_click'
  | 'outbound_click'
  | 'project_view'
  | 'faq_open'
  | 'scroll_depth'

function getSessionId(): string | null {
  // sessionStorage throws in some privacy modes, so nothing here may assume it.
  try {
    let sid = sessionStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    // No storage: fall back to a per-page-load id. Pageviews still land, they
    // just do not group into a session.
    try {
      return crypto.randomUUID()
    } catch {
      return null
    }
  }
}

function send(type: EventType, extra: Record<string, unknown> = {}) {
  const sid = getSessionId()
  if (!sid) return

  const payload = JSON.stringify({
    sid,
    type,
    path: window.location.pathname,
    ...extra,
  })

  try {
    // sendBeacon survives the page being closed, which matters for the final
    // heartbeat and for outbound clicks that navigate away immediately.
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/collect', new Blob([payload], { type: 'application/json' }))
      return
    }
  } catch {
    /* fall through */
  }

  // keepalive lets the request outlive the page for the same reason.
  fetch('/api/collect', {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {})
}

/** Fire a conversion event from anywhere in the app. */
export function trackEvent(type: Exclude<EventType, 'pageview' | 'heartbeat'>, meta?: Record<string, unknown>) {
  send(type, { meta })
}

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Engaged time is only counted while the tab is actually visible, so an
  // abandoned background tab does not inflate the average.
  const engagedRef = useRef(0)
  const lastTickRef = useRef<number>(Date.now())
  const maxScrollRef = useRef(0)
  const sentScrollRef = useRef(false)

  // ── Pageview ────────────────────────────────────────────────
  useEffect(() => {
    engagedRef.current = 0
    lastTickRef.current = Date.now()
    maxScrollRef.current = 0
    sentScrollRef.current = false

    send('pageview', {
      referrer: document.referrer || null,
      screen_w: window.screen?.width ?? null,
      screen_h: window.screen?.height ?? null,
      viewport_w: window.innerWidth,
      viewport_h: window.innerHeight,
      color_scheme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    })

    // A project detail view is worth its own event: it is the clearest signal
    // of which work someone actually cared about.
    const match = pathname.match(/^\/projects\/([^/]+)$/)
    if (match) trackEvent('project_view', { slug: match[1] })
    // searchParams is in the dep list so a ?utm_* change re-registers the view.
  }, [pathname, searchParams])

  // ── Heartbeat + engaged time ────────────────────────────────
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== 'visible') {
        lastTickRef.current = Date.now()
        return
      }
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now
      engagedRef.current += delta
      send('heartbeat', { engaged_ms: delta })
    }

    const id = setInterval(tick, HEARTBEAT_MS)

    const onVisibility = () => {
      lastTickRef.current = Date.now()
      if (document.visibilityState === 'hidden') flushScroll()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // ── Scroll depth ────────────────────────────────────────────
  const flushScroll = () => {
    if (sentScrollRef.current || maxScrollRef.current < 25) return
    sentScrollRef.current = true
    trackEvent('scroll_depth', { depth: maxScrollRef.current })
  }

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const doc = document.documentElement
        const scrollable = doc.scrollHeight - window.innerHeight
        if (scrollable <= 0) return
        const pct = Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100)
        // Bucket to 25/50/75/100 — finer granularity is noise.
        const bucket = pct >= 90 ? 100 : pct >= 75 ? 75 : pct >= 50 ? 50 : pct >= 25 ? 25 : 0
        if (bucket > maxScrollRef.current) maxScrollRef.current = bucket
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', flushScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', flushScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  // ── Conversion clicks ───────────────────────────────────────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest('a, button')
      if (!el) return

      // CV download: matched on the href, since the button is a plain <button>
      // that builds a link at click time.
      const text = (el.textContent ?? '').trim().toLowerCase()
      if (el.tagName === 'BUTTON' && text.includes('cv')) {
        trackEvent('cv_download', { label: text.slice(0, 80) })
        return
      }

      if (el.tagName !== 'A') return
      const href = (el as HTMLAnchorElement).href
      if (!href) return

      if (href.startsWith('mailto:')) {
        trackEvent('email_click', { href: href.slice(0, 200) })
        return
      }

      if (href.toLowerCase().includes('.pdf') || /dropbox|drive\.google/i.test(href)) {
        trackEvent('cv_download', { href: href.slice(0, 200) })
        return
      }

      try {
        const url = new URL(href)
        if (url.hostname !== window.location.hostname) {
          trackEvent('outbound_click', {
            href: href.slice(0, 200),
            host: url.hostname,
          })
        }
      } catch {
        /* not a parseable URL — ignore */
      }
    }

    // Capture phase, so a handler that stops propagation cannot hide the click.
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  // ── FAQ opens ───────────────────────────────────────────────
  useEffect(() => {
    const onToggle = (e: Event) => {
      const el = e.target as HTMLDetailsElement
      if (el.tagName !== 'DETAILS' || !el.open) return
      const q = el.querySelector('h3')?.textContent?.trim().slice(0, 140)
      trackEvent('faq_open', { question: q ?? null })
    }
    // 'toggle' does not bubble, so it has to be captured.
    document.addEventListener('toggle', onToggle, { capture: true })
    return () => document.removeEventListener('toggle', onToggle, { capture: true })
  }, [pathname])

  return null
}
