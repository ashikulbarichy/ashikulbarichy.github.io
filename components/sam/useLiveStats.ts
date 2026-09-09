'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/browser'
import type { SamStats } from '@/lib/sam/stats'

export type LiveStatus = 'connecting' | 'live' | 'polling' | 'error'

/**
 * Keeps the dashboard current.
 *
 * Two mechanisms, on purpose:
 *
 *   1. Supabase Realtime as a TRIGGER. A new row in `events` or `sessions`
 *      means the numbers changed, so refetch. Realtime carries the signal, not
 *      the data — recomputing aggregates client-side from individual rows would
 *      drift out of step with the SQL, and this way there is exactly one
 *      definition of every metric.
 *
 *   2. A slow poll as a SAFETY NET. Realtime channels drop: laptop sleeps,
 *      network changes, quota. Without a fallback the dashboard would sit there
 *      looking authoritative and be an hour stale. The poll is slow when
 *      Realtime is healthy and fast when it is not.
 *
 * Refetches are debounced, so a burst of pageviews causes one request rather
 * than one per row.
 */

const DEBOUNCE_MS = 1200
const POLL_LIVE_MS = 30_000 // Realtime is connected; this is belt-and-braces
const POLL_FALLBACK_MS = 8_000 // Realtime is down; poll harder

export function useLiveStats(initial: SamStats) {
  const [stats, setStats] = useState<SamStats>(initial)
  const [days, setDays] = useState<number>(initial.days)
  const [status, setStatus] = useState<LiveStatus>('connecting')
  const [pulse, setPulse] = useState(0)

  const daysRef = useRef(days)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlightRef = useRef(false)
  const statusRef = useRef<LiveStatus>('connecting')

  daysRef.current = days
  statusRef.current = status

  const refetch = useCallback(async () => {
    // Never stack requests; a burst collapses into the one already running.
    if (inFlightRef.current) return
    inFlightRef.current = true
    try {
      const res = await fetch(`/api/sam/stats?days=${daysRef.current}`, { cache: 'no-store' })
      if (res.status === 401 || res.status === 403) {
        setStatus('error')
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: SamStats = await res.json()
      setStats(json)
      setPulse((n) => n + 1)
      // A successful fetch means the data path is fine even if Realtime is not.
      if (statusRef.current === 'error') setStatus('polling')
    } catch {
      setStatus((s) => (s === 'live' ? 'polling' : s))
    } finally {
      inFlightRef.current = false
    }
  }, [])

  const scheduleRefetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(refetch, DEBOUNCE_MS)
  }, [refetch])

  // ── Range changes refetch immediately ───────────────────────
  useEffect(() => {
    if (days === stats.days) return
    refetch()
    // stats.days intentionally omitted: including it would re-run on every
    // successful fetch and loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, refetch])

  // ── Realtime subscription ───────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    try {
      channel = supabase
        .channel('sam-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, () =>
          scheduleRefetch()
        )
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions' }, () =>
          scheduleRefetch()
        )
        .subscribe((s) => {
          if (s === 'SUBSCRIBED') setStatus('live')
          else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' || s === 'CLOSED') {
            setStatus('polling')
          }
        })
    } catch {
      setStatus('polling')
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [scheduleRefetch])

  // ── Polling safety net ──────────────────────────────────────
  useEffect(() => {
    const interval = status === 'live' ? POLL_LIVE_MS : POLL_FALLBACK_MS
    const id = setInterval(() => {
      // No point polling a dashboard nobody is looking at.
      if (document.visibilityState === 'visible') refetch()
    }, interval)

    // Coming back to the tab should show current numbers immediately, not
    // whatever was on screen when it was backgrounded.
    const onVisible = () => {
      if (document.visibilityState === 'visible') refetch()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [status, refetch])

  return { stats, status, days, setDays, refetch, pulse }
}
