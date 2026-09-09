'use client'

import { useEffect, useState } from 'react'

interface Viewer {
  session_id: string
  current_path: string | null
  city: string | null
  region: string | null
  country: string | null
  device_type: string | null
  browser: string | null
  seconds_ago: number
}

/**
 * Live viewer panel. Polls /api/sam/live every 5 seconds.
 *
 * Pauses while the tab is hidden — no point polling a dashboard nobody is
 * looking at, and it keeps the request count sane if you leave it open.
 */
export default function LiveViewers() {
  const [viewers, setViewers] = useState<Viewer[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (document.visibilityState !== 'visible') return
      try {
        const res = await fetch('/api/sam/live', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (cancelled) return
        setViewers(json.viewers ?? [])
        setError(json.error ?? null)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'failed')
      }
    }

    load()
    const id = setInterval(load, 5000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const count = viewers?.length ?? 0

  return (
    <section className="mb-12">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Live now
        </h2>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              count > 0 ? 'animate-pulse bg-emerald-400' : 'bg-zinc-700'
            }`}
          />
          <span className="font-garamond text-2xl font-medium text-white">
            {viewers === null ? '—' : count}
          </span>
        </span>
      </div>

      {error && (
        <p className="font-mono text-[10px] text-amber-500/70">
          {error === 'unauthorised' ? 'Session expired — reload.' : error}
        </p>
      )}

      {viewers !== null && count === 0 && !error && (
        <p className="border-t border-zinc-900 pt-4 font-mono text-xs text-zinc-700">
          Nobody on the site in the last 30 seconds.
        </p>
      )}

      {count > 0 && (
        <ul className="divide-y divide-zinc-900 border-y border-zinc-900">
          {viewers!.map((v) => (
            <li
              key={v.session_id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2.5"
            >
              <span className="font-mono text-xs text-zinc-200">{v.current_path ?? '/'}</span>
              <span className="flex flex-wrap items-center gap-x-4 font-mono text-[10px] text-zinc-500">
                <span>
                  {[v.city, v.country].filter(Boolean).join(', ') || 'Unknown location'}
                </span>
                <span>{[v.device_type, v.browser].filter(Boolean).join(' · ')}</span>
                <span className="text-zinc-700">{v.seconds_ago}s ago</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
