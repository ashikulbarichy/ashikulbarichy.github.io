'use client'

import { useEffect, useState } from 'react'

interface Diag {
  verdict: string
  collection: { configured: boolean; configError: string | null }
  data: {
    sessions: number
    events: number
    readError: string | null
    lastEventAt: string | null
    lastEvent: string | null
  }
}

/**
 * Shown only when something is wrong.
 *
 * The failure this exists for: a placeholder service-role key made every write
 * 401, so the dashboard displayed a confident zero across every panel with no
 * hint that collection was broken at all. An empty dashboard should say why it
 * is empty.
 */
export default function CollectionHealth() {
  const [diag, setDiag] = useState<Diag | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/sam/diag', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setDiag(d)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!diag) return null

  const healthy =
    diag.collection.configured && !diag.data.readError && diag.data.events > 0
  if (healthy) return null

  const severe = !diag.collection.configured || Boolean(diag.data.readError)

  return (
    <div
      className={`mb-8 rounded-sm border px-4 py-3 font-mono text-xs ${
        severe
          ? 'border-red-900/50 bg-red-950/20 text-red-300'
          : 'border-amber-900/50 bg-amber-950/20 text-amber-300'
      }`}
    >
      <p className="mb-1.5 font-semibold uppercase tracking-[0.15em] text-[10px]">
        {severe ? 'Collection not working' : 'No data recorded yet'}
      </p>
      <p className="leading-relaxed opacity-90">{diag.verdict}</p>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[10px] opacity-60">
        <span>sessions: {diag.data.sessions}</span>
        <span>events: {diag.data.events}</span>
        {diag.data.lastEvent && <span>last: {diag.data.lastEvent}</span>}
      </div>
    </div>
  )
}
