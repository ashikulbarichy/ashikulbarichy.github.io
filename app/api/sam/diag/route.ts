import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SAM_ALLOWED_EMAIL } from '@/lib/supabase/config'
import { ingestConfigError } from '@/lib/analytics/ingest'
import { client as sanityClient } from '@/lib/sanity/client'
import { identityGaps } from '@/lib/sanity/queries'

/**
 * Collection health check.
 *
 * Exists because "the live count is 0" has two completely different causes
 * that look identical on the dashboard: nobody is visiting, or collection is
 * broken. This tells them apart.
 *
 * Auth-gated like every other /api/sam route — it reveals which env vars are
 * set, which is not something to hand out anonymously. It reports only whether
 * a value is present and well-formed, never the value itself.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })

  if (SAM_ALLOWED_EMAIL && (user.email ?? '').toLowerCase() !== SAM_ALLOWED_EMAIL) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const sanity = await checkSanity()

  const [sessions, events, latestEvent, latestSession] = await Promise.all([
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('ts, event_type, path').order('ts', { ascending: false }).limit(1),
    supabase
      .from('sessions')
      .select('last_seen_at, is_bot, city, country')
      .order('last_seen_at', { ascending: false })
      .limit(1),
  ])

  const sessionCount = sessions.count ?? 0
  const eventCount = events.count ?? 0
  const readError = sessions.error?.message ?? events.error?.message ?? null

  // Work out the single most useful next action rather than making the reader
  // interpret a wall of booleans.
  let verdict: string
  if (ingestConfigError) {
    verdict = `Collection is DISABLED: ${ingestConfigError}. Set it in .env.local (restart the dev server) and in Vercel, then redeploy.`
  } else if (readError) {
    verdict = `Cannot read the tables: ${readError}. If this mentions a missing relation, run supabase/migrations/0001_analytics.sql.`
  } else if (eventCount === 0 && sessionCount === 0) {
    verdict =
      'Config looks right but nothing has been recorded. Load the public site in another tab, wait ~2s, and refresh this. If it stays at 0, check the server logs for "[analytics]" lines.'
  } else {
    verdict = 'Collection is working.'
  }

  return NextResponse.json(
    {
      verdict,
      sanity,
      collection: {
        configured: ingestConfigError === null,
        configError: ingestConfigError,
      },
      data: {
        sessions: sessionCount,
        events: eventCount,
        readError,
        lastEventAt: latestEvent.data?.[0]?.ts ?? null,
        lastEvent: latestEvent.data?.[0]
          ? `${latestEvent.data[0].event_type} ${latestEvent.data[0].path}`
          : null,
        lastSessionSeenAt: latestSession.data?.[0]?.last_seen_at ?? null,
      },
      env: {
        // Presence and shape only — never the values.
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        ANALYTICS_SALT: Boolean(process.env.ANALYTICS_SALT),
        SAM_ALLOWED_EMAIL: Boolean(process.env.SAM_ALLOWED_EMAIL),
      },
      now: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

/**
 * Sanity content health.
 *
 * Answers "why has my content not updated" without guesswork. The common
 * causes are all visible from here: the seed never ran, a singleton was
 * hand-created and left half-empty, or projects have no slug so their URLs are
 * raw document ids.
 */
async function checkSanity() {
  if (!sanityClient) {
    return { ok: false, problems: ['Sanity is not configured (NEXT_PUBLIC_SANITY_PROJECT_ID unset)'] }
  }

  try {
    const d = await sanityClient.fetch<{
      identity: Record<string, unknown> | null
      uiText: number
      faq: number
      projectsTotal: number
      projectsWithSlug: number
      settings: { seoTitle: string | null; seoDescription: string | null } | null
    }>(`{
      "identity": *[_type == "identity"][0],
      "uiText": count(*[_type == "uiText"]),
      "faq": count(*[_type == "faq"]),
      "projectsTotal": count(*[_type == "project"]),
      "projectsWithSlug": count(*[_type == "project" && defined(slug.current)]),
      "settings": *[_type == "siteSettings"][0]{seoTitle, seoDescription}
    }`)

    const problems: string[] = []

    const gaps = identityGaps(d.identity)
    if (gaps.length) {
      problems.push(`identity is incomplete (${gaps.join(', ')}) — those fields fall back to code`)
    }
    if (d.uiText === 0) problems.push('no uiText document — UI labels come from code and are not editable')
    if (d.faq === 0) problems.push('no faq documents — /faq is empty and set to noindex')
    if (d.projectsTotal > 0 && d.projectsWithSlug < d.projectsTotal) {
      problems.push(
        `${d.projectsTotal - d.projectsWithSlug} of ${d.projectsTotal} projects have no slug — their URLs are raw document ids`
      )
    }
    // A hardcoded seoTitle stops the metadata tracking Identity.
    if (d.settings?.seoTitle?.trim()) {
      problems.push(
        'siteSettings.seoTitle is set, so the page title no longer derives from Identity — clear it to make it track your content'
      )
    }

    return {
      ok: problems.length === 0,
      problems,
      counts: {
        identity: d.identity ? 1 : 0,
        uiText: d.uiText,
        faq: d.faq,
        projects: d.projectsTotal,
        projectsWithSlug: d.projectsWithSlug,
      },
      fix: problems.length
        ? 'Run: SANITY_WRITE_TOKEN=xxx node scripts/seed-seo.mjs --force --dry-run, read the plan, then re-run without --dry-run.'
        : null,
    }
  } catch (err) {
    return { ok: false, problems: [`Sanity query failed: ${(err as Error).message}`] }
  }
}
