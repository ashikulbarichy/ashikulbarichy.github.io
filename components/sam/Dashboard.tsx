'use client'

import { useEffect, useRef, useState } from 'react'
import type { SamStats, Breakdown } from '@/lib/sam/stats'
import { useLiveStats, type LiveStatus } from './useLiveStats'
import LiveViewers from './LiveViewers'
import SignOutButton from './SignOutButton'

const RANGES: { days: number; label: string }[] = [
  { days: 1, label: '24h' },
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
]

export default function Dashboard({
  initial,
  email,
}: {
  initial: SamStats
  email: string | undefined
}) {
  const { stats, status, days, setDays, refetch, pulse } = useLiveStats(initial)

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10 md:px-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="font-garamond text-4xl font-medium tracking-tighter text-white">sam</h1>
          <div className="mt-2 flex items-center gap-3">
            <StatusDot status={status} />
            <UpdatedAt iso={stats.generatedAt} pulse={pulse} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex overflow-hidden rounded-sm border border-zinc-800">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
                  days === r.days
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={refetch}
            className="border-b border-zinc-800 pb-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:border-white hover:text-white"
          >
            Refresh
          </button>
          <span className="font-mono text-[10px] text-zinc-700">{email}</span>
          <SignOutButton />
        </div>
      </header>

      {stats.error && (
        <div className="mb-8 rounded-sm border border-amber-900/50 bg-amber-950/20 px-4 py-3 font-mono text-xs text-amber-300">
          <p className="mb-1 font-semibold">Query error</p>
          <p className="text-amber-400/80">{stats.error}</p>
          <p className="mt-2 text-amber-500/60">
            If this says a function is missing, run the files in supabase/migrations in order.
          </p>
        </div>
      )}

      <LiveViewers />

      <section className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-zinc-900 bg-zinc-900 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Pageviews" value={stats.overview?.pageviews} />
        <Stat label="Visitors" value={stats.overview?.visitors} />
        <Stat label="Sessions" value={stats.overview?.sessions} />
        <Stat label="Bounce" value={stats.overview?.bounce_rate} suffix="%" />
        <Stat label="Avg engaged" value={stats.overview?.avg_engaged_seconds} suffix="s" />
        <Stat label="Bot hits" value={stats.overview?.bot_hits} />
      </section>

      <Chart data={stats.timeseries} />

      <div className="grid gap-10 lg:grid-cols-2">
        <Panel title="Top pages" rows={stats.topPages} labelKey="path" valueKey="pageviews" />
        <Panel title="Referrers" rows={stats.referrers} labelKey="label" valueKey="sessions" />
        <Panel
          title="Traffic type"
          rows={stats.referrerGroups}
          labelKey="label"
          valueKey="sessions"
          note="ai_assistant means a human clicked through from ChatGPT, Perplexity or Claude."
        />
        <Panel
          title="Conversions"
          rows={stats.conversions}
          labelKey="event_type"
          valueKey="count"
          note="CV downloads and email clicks are the ones that matter."
        />
        <Panel title="Countries" rows={stats.countries} labelKey="label" valueKey="sessions" />
        <Panel title="Cities" rows={stats.cities} labelKey="label" valueKey="sessions" />
        <Panel title="Devices" rows={stats.devices} labelKey="label" valueKey="sessions" />
        <Panel title="Browsers" rows={stats.browsers} labelKey="label" valueKey="sessions" />
        <Panel
          title="Operating systems"
          rows={stats.operatingSystems}
          labelKey="label"
          valueKey="sessions"
        />
        <CrawlerPanel rows={stats.crawlers} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

function StatusDot({ status }: { status: LiveStatus }) {
  const map: Record<LiveStatus, { dot: string; text: string; label: string }> = {
    connecting: { dot: 'bg-zinc-600', text: 'text-zinc-600', label: 'Connecting' },
    live: { dot: 'bg-emerald-400 animate-pulse', text: 'text-emerald-500/80', label: 'Live' },
    polling: { dot: 'bg-amber-400', text: 'text-amber-500/80', label: 'Polling' },
    error: { dot: 'bg-red-500', text: 'text-red-400/80', label: 'Session expired' },
  }
  const s = map[status]
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${s.text}`}>{s.label}</span>
    </span>
  )
}

/** Ticks every second so it is obvious at a glance whether data is moving. */
function UpdatedAt({ iso, pulse }: { iso: string; pulse: number }) {
  const [, force] = useState(0)
  const flashRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Brief flash whenever new data lands, so an update is visible even when the
  // numbers happen not to change.
  useEffect(() => {
    const el = flashRef.current
    if (!el || pulse === 0) return
    el.classList.remove('text-emerald-400')
    void el.offsetWidth // restart the transition
    el.classList.add('text-emerald-400')
    const id = setTimeout(() => el.classList.remove('text-emerald-400'), 700)
    return () => clearTimeout(id)
  }, [pulse])

  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  const text =
    seconds < 5 ? 'just now' : seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`

  return (
    <span
      ref={flashRef}
      className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-700 transition-colors duration-300"
    >
      updated {text}
    </span>
  )
}

function Stat({
  label,
  value,
  suffix = '',
}: {
  label: string
  value: number | null | undefined
  suffix?: string
}) {
  return (
    <div className="bg-black px-4 py-5">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">{label}</p>
      <p className="font-garamond text-2xl font-medium tabular-nums text-white">
        {value === null || value === undefined ? '—' : `${value}${suffix}`}
      </p>
    </div>
  )
}

/** Inline SVG bar chart — no chart library, no extra bundle. */
function Chart({ data }: { data: SamStats['timeseries'] }) {
  if (data.length < 2) return null

  const max = Math.max(...data.map((d) => Number(d.pageviews) || 0), 1)
  const w = 100
  const h = 28
  const gap = 0.4
  const barW = w / data.length - gap

  return (
    <section className="mb-12">
      <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        Pageviews
      </h2>
      <div className="border-y border-zinc-900 py-4">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="h-24 w-full"
          role="img"
          aria-label={`Pageviews over the last ${data.length} days, peak ${max}`}
        >
          {data.map((d, i) => {
            const v = Number(d.pageviews) || 0
            const bh = v === 0 ? 0.4 : (v / max) * h
            return (
              <rect
                key={d.day}
                x={i * (barW + gap)}
                y={h - bh}
                width={barW}
                height={bh}
                className={v === 0 ? 'fill-zinc-900' : 'fill-zinc-500'}
              />
            )
          })}
        </svg>
        <div className="mt-2 flex justify-between font-mono text-[9px] text-zinc-700">
          <span>{data[0]?.day}</span>
          <span>peak {max}</span>
          <span>{data[data.length - 1]?.day}</span>
        </div>
      </div>
    </section>
  )
}

function Panel<T extends object>({
  title,
  rows,
  labelKey,
  valueKey,
  note,
}: {
  title: string
  rows: T[]
  labelKey: keyof T & string
  valueKey: keyof T & string
  note?: string
}) {
  const max = Math.max(...rows.map((r) => Number(r[valueKey]) || 0), 1)

  return (
    <section>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{title}</h2>
      <p className="mb-3 mt-1 min-h-[1.1rem] font-mono text-[9px] leading-relaxed text-zinc-700">
        {note ?? ''}
      </p>

      {rows.length === 0 ? (
        <p className="border-t border-zinc-900 pt-4 font-mono text-xs text-zinc-700">
          No data yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-900 border-y border-zinc-900">
          {rows.map((row, i) => {
            const value = Number(row[valueKey]) || 0
            return (
              <li key={i} className="relative flex items-center justify-between px-2 py-2.5">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-zinc-900/60 transition-[width] duration-500"
                  style={{ width: `${(value / max) * 100}%` }}
                />
                <span className="relative truncate pr-4 font-mono text-xs text-zinc-300">
                  {String(row[labelKey] ?? 'Unknown')}
                </span>
                <span className="relative flex-none font-mono text-xs tabular-nums text-zinc-500">
                  {value}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function CrawlerPanel({ rows }: { rows: SamStats['crawlers'] }) {
  const max = Math.max(...rows.map((r) => Number(r.hits) || 0), 1)

  return (
    <section>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        Crawlers (incl. AI)
      </h2>
      <p className="mb-3 mt-1 min-h-[1.1rem] font-mono text-[9px] leading-relaxed text-zinc-700">
        A ✓ means that bot fetched /llms.txt — the clearest sign the AI-SEO work is being read.
      </p>

      {rows.length === 0 ? (
        <p className="border-t border-zinc-900 pt-4 font-mono text-xs text-zinc-700">
          No crawler hits yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-900 border-y border-zinc-900">
          {rows.map((row) => {
            const hits = Number(row.hits) || 0
            return (
              <li
                key={row.bot_name}
                className="relative flex items-center justify-between px-2 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 bg-zinc-900/60 transition-[width] duration-500"
                  style={{ width: `${(hits / max) * 100}%` }}
                />
                <span className="relative flex min-w-0 items-center gap-2 pr-4">
                  <span className="truncate font-mono text-xs text-zinc-300">{row.bot_name}</span>
                  {row.fetched_llms_txt && (
                    <span
                      title="Fetched /llms.txt"
                      className="flex-none font-mono text-[10px] text-emerald-500"
                    >
                      ✓
                    </span>
                  )}
                </span>
                <span className="relative flex flex-none items-center gap-3 font-mono text-xs tabular-nums text-zinc-500">
                  <span className="text-zinc-700">{row.distinct_paths} paths</span>
                  <span>{hits}</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export type { Breakdown }
