import { getIdentity } from '@/lib/sanity/queries'

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
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
