import {
  getIdentity,
  getSiteSettings,
  getIndexableProjects,
  getFaqs,
} from '@/lib/sanity/queries'
import { SITE_URL } from '@/lib/seo/site'

/**
 * /llms.txt — generated from Sanity.
 *
 * A plain-prose brief for AI assistants. Two things make this worth serving:
 *
 *   1. Most AI crawlers do not execute JavaScript, so a compact text file is
 *      the highest-signal thing you can hand them.
 *   2. Because it is generated rather than hand-written, it cannot drift out
 *      of sync with the site. The previous hand-maintained version claimed a
 *      Master's degree that does not exist and listed a city as a university.
 *
 * Kept deliberately free of keyword lists. The old file ended with a
 * "Keywords for AI Search" block, which reads as spam to the exact audience it
 * was aimed at.
 */

/**
 * ISR: re-render at most once every 60 seconds.
 *
 * Without this the route is fully static — Next bakes the HTML at build time
 * and serves it from the Full Route Cache indefinitely, so a Sanity edit only
 * appeared after a redeploy. The `revalidate` on the data functions in
 * lib/sanity/queries.ts was not enough on its own: that governs the cached
 * query result, not whether the page is ever rendered again.
 *
 * The webhook at /api/revalidate is still the fast path (seconds, by tag).
 * This is the floor that guarantees freshness when the webhook is not
 * configured or a delivery fails.
 */
export const revalidate = 60

const line = (s?: string | null) => (s ? [s] : [])

export async function GET() {
  const [identity, settings, projects, faqs] = await Promise.all([
    getIdentity(),
    getSiteSettings(),
    getIndexableProjects(),
    getFaqs(),
  ])

  const employer = identity.currentEmployer
  const out: string[] = []

  // ── Header ─────────────────────────────────────────────────
  out.push(`# ${identity.fullName}`, '')
  out.push(`> ${settings.llmsIntro?.trim() || `${identity.headline}. Based in ${identity.locality}, ${identity.countryName}.`}`, '')

  // ── About ──────────────────────────────────────────────────
  out.push('## About', '', identity.bio, '')

  // ── Contact ────────────────────────────────────────────────
  out.push('## Contact', '')
  out.push(`- Email: ${identity.email}`)
  out.push(...line(identity.telephone ? `- Phone: ${identity.telephone}` : null))
  out.push(`- Website: ${SITE_URL}`)
  for (const url of identity.sameAs) out.push(`- ${labelForUrl(url)}: ${url}`)
  out.push(`- Location: ${identity.locality}, ${identity.countryName}`)
  out.push('')

  // ── Expertise ──────────────────────────────────────────────
  if (identity.knowsAbout.length) {
    out.push('## Skills and expertise', '')
    for (const skill of identity.knowsAbout) out.push(`- ${skill}`)
    out.push('')
  }

  // ── Experience ─────────────────────────────────────────────
  if (employer?.name) {
    out.push('## Current role', '')
    const heading = [employer.role, employer.name].filter(Boolean).join(' — ')
    out.push(
      `### ${heading}${employer.startDate ? ` (${employer.startDate}–present)` : ''}`
    )
    if (employer.summary) out.push(employer.summary)
    out.push('')
  }

  // ── Education ──────────────────────────────────────────────
  if (identity.education.length) {
    out.push('## Education', '')
    for (const e of identity.education) {
      const where = [e.institution, e.locality].filter(Boolean).join(', ')
      const when = [e.startYear, e.endYear].filter(Boolean).join('–')
      out.push(`- ${e.degree} — ${where}${when ? ` (${when})` : ''}`)
      if (e.note) out.push(`  ${e.note}`)
    }
    out.push('')
  }

  // ── Certifications ─────────────────────────────────────────
  if (identity.certifications.length) {
    out.push('## Certifications', '')
    for (const c of identity.certifications) {
      const year = c.year ? ` (${c.year})` : ''
      const verify = c.credentialUrl ? ` — ${c.credentialUrl}` : ''
      out.push(`- ${c.name}, ${c.issuer}${year}${verify}`)
    }
    out.push('')
  }

  // ── Projects ───────────────────────────────────────────────
  if (projects.length) {
    out.push('## Projects', '')
    out.push(`Full portfolio: ${SITE_URL}/projects`, '')
    for (const p of projects) {
      out.push(`### ${p.title}`)
      if (p.summary || p.description) out.push(p.summary || p.description)
      const facts: string[] = []
      if (p.tags.length) facts.push(`Built with ${p.tags.join(', ')}.`)
      if (p.role) facts.push(`Role: ${p.role}.`)
      if (p.projectUrl) facts.push(`Live at ${p.projectUrl}`)
      if (p.githubUrl) facts.push(`Source: ${p.githubUrl}`)
      if (facts.length) out.push(facts.join(' '))
      out.push(`Details: ${SITE_URL}/projects/${p.slug}`, '')
    }
  }

  // ── Availability ───────────────────────────────────────────
  if (identity.openToWork && identity.seeksRoles.length) {
    out.push('## Availability', '', 'Open to:', '')
    for (const role of identity.seeksRoles) out.push(`- ${role}`)
    if (identity.seeksLocations.length) {
      out.push('', `Locations: ${identity.seeksLocations.join(', ')}.`)
    }
    out.push('')
  }

  // ── FAQ ────────────────────────────────────────────────────
  if (faqs.length) {
    out.push('## Frequently asked questions', '')
    for (const f of faqs) {
      out.push(`### ${f.question}`, f.answer, '')
    }
  }

  return new Response(out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    },
  })
}

function labelForUrl(url: string): string {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  })()
  const map: Record<string, string> = {
    'github.com': 'GitHub',
    'linkedin.com': 'LinkedIn',
    'twitter.com': 'X',
    'x.com': 'X',
    'stackoverflow.com': 'Stack Overflow',
    'orcid.org': 'ORCID',
  }
  return map[host] ?? host
}
