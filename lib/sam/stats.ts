import type { createClient } from '@/lib/supabase/server'

/**
 * The dashboard query layer.
 *
 * Lives here rather than in the route handler because a Next.js `route.ts` may
 * only export the HTTP verbs and route config — exporting a helper from one is
 * a build error. Keeping it in lib also means the /sam server component and the
 * /api/sam/stats handler share the exact same queries, so the first paint and
 * every live refresh can never disagree.
 */

type Client = ReturnType<typeof createClient>

export interface SamStats {
  days: number
  generatedAt: string
  error: string | null
  overview: {
    pageviews: number
    sessions: number
    visitors: number
    bounce_rate: number | null
    avg_engaged_seconds: number | null
    bot_hits: number
  } | null
  timeseries: { day: string; pageviews: number; visitors: number }[]
  topPages: { path: string; pageviews: number; visitors: number }[]
  countries: Breakdown[]
  cities: Breakdown[]
  devices: Breakdown[]
  browsers: Breakdown[]
  operatingSystems: Breakdown[]
  referrers: Breakdown[]
  referrerGroups: Breakdown[]
  crawlers: {
    bot_name: string
    hits: number
    distinct_paths: number
    last_seen_at: string
    fetched_llms_txt: boolean
  }[]
  conversions: { event_type: string; count: number; last_at: string }[]
}

export interface Breakdown {
  label: string
  sessions: number
  visitors: number
}

/**
 * Shared by this route and the /sam server component, so the first paint and
 * every refresh go through identical queries.
 */
export async function fetchStats(supabase: Client, days: number): Promise<SamStats> {
  const breakdown = (field: string, max = 10) =>
    supabase.rpc('sam_breakdown', { field, days, max_rows: max })

  const [
    overview,
    timeseries,
    topPages,
    countries,
    cities,
    devices,
    browsers,
    operatingSystems,
    referrers,
    referrerGroups,
    crawlers,
    conversions,
  ] = await Promise.all([
    supabase.rpc('sam_overview', { days }).maybeSingle(),
    supabase.rpc('sam_timeseries', { days }),
    supabase.rpc('sam_top_pages', { days, max_rows: 12 }),
    breakdown('country'),
    breakdown('city'),
    breakdown('device_type', 5),
    breakdown('browser', 8),
    breakdown('os', 8),
    breakdown('referrer_source'),
    breakdown('referrer_group', 6),
    supabase.rpc('sam_crawlers', { days }),
    supabase.rpc('sam_conversions', { days }),
  ])

  // Surface the first real error rather than silently rendering empty panels —
  // a missing RPC means the migrations were not run, and that should be loud.
  const error =
    [
      overview.error,
      timeseries.error,
      topPages.error,
      countries.error,
      crawlers.error,
      conversions.error,
    ].find(Boolean)?.message ?? null

  return {
    days,
    generatedAt: new Date().toISOString(),
    error,
    overview: (overview.data as SamStats['overview']) ?? null,
    timeseries: (timeseries.data as SamStats['timeseries']) ?? [],
    topPages: (topPages.data as SamStats['topPages']) ?? [],
    countries: (countries.data as Breakdown[]) ?? [],
    cities: (cities.data as Breakdown[]) ?? [],
    devices: (devices.data as Breakdown[]) ?? [],
    browsers: (browsers.data as Breakdown[]) ?? [],
    operatingSystems: (operatingSystems.data as Breakdown[]) ?? [],
    referrers: (referrers.data as Breakdown[]) ?? [],
    referrerGroups: (referrerGroups.data as Breakdown[]) ?? [],
    crawlers: (crawlers.data as SamStats['crawlers']) ?? [],
    conversions: (conversions.data as SamStats['conversions']) ?? [],
  }
}
