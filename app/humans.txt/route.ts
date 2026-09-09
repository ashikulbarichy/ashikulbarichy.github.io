import { getIdentity } from '@/lib/sanity/queries'

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

/** /humans.txt — generated from the same identity document as everything else. */
export async function GET() {
  const identity = await getIdentity()
  const employer = identity.currentEmployer
  const out: string[] = []

  out.push('/* TEAM */')
  out.push(`Name: ${identity.fullName}`)
  out.push(`Role: ${identity.headline}`)
  if (employer?.name && employer.role) out.push(`Also: ${employer.role}, ${employer.name}`)
  out.push(`Location: ${identity.locality}, ${identity.countryName}`)
  out.push(`Email: ${identity.email}`)
  for (const url of identity.sameAs) out.push(url)
  out.push('')

  if (identity.education.length) {
    out.push('/* EDUCATION */')
    for (const e of identity.education) {
      const when = [e.startYear, e.endYear].filter(Boolean).join('-')
      out.push(
        `${e.degree} — ${[e.institution, e.locality].filter(Boolean).join(', ')}${when ? ` (${when})` : ''}`
      )
    }
    out.push('')
  }

  if (identity.certifications.length) {
    out.push('/* CERTIFICATIONS */')
    for (const c of identity.certifications) out.push(`${c.name}, ${c.issuer}`)
    out.push('')
  }

  if (identity.knowsAbout.length) {
    out.push('/* SKILLS */')
    out.push(identity.knowsAbout.join(', '))
    out.push('')
  }

  out.push('/* SITE */')
  out.push('Language: English')
  out.push('Standards: HTML5, CSS3, TypeScript')
  out.push('Components: React, Next.js, Tailwind CSS')
  out.push('CMS: Sanity.io')

  return new Response(out.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    },
  })
}
