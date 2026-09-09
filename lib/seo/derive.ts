import type { Identity } from '@/lib/types'

/**
 * Derivation helpers.
 *
 * These exist so that Identity is genuinely the single source of truth. When
 * a field in `siteSettings` is left blank, the value is computed from Identity
 * rather than falling back to a string frozen in the code.
 *
 * The practical effect: change `headline` or `bio` in Sanity and the homepage
 * title, meta description, Open Graph tags, llms.txt and Person JSON-LD all
 * move together. Nothing to remember to update twice, which is what let the
 * old site drift into claiming a job title its own hero copy contradicted.
 *
 * Type an explicit `seoTitle` / `seoDescription` in Sanity to override.
 */

/**
 * Title, derived. Uses the primary job title rather than the full headline,
 * because headlines like "ASP.NET API Developer, building toward GRC" push the
 * result past the ~60 characters Google will display.
 *
 * e.g. "Ashikul Bari Chowdhury | Backend Developer, Dhaka"
 */
export function deriveTitle(identity: Identity): string {
  const role = identity.jobTitles[0]?.trim()
  const place = identity.locality?.trim()

  const parts = [role, place].filter(Boolean).join(', ')
  if (!parts) return identity.fullName

  const full = `${identity.fullName} | ${parts}`
  // If the primary title is unusually long, drop the location before the name.
  if (full.length > 62 && role) return `${identity.fullName} | ${role}`
  return full
}

/**
 * Description, derived from the bio.
 *
 * Trims on sentence boundaries rather than mid-word, because this text is read
 * by a person in a search result. Falls back to word-boundary trimming when
 * the first sentence alone is already too long.
 */
export function deriveDescription(identity: Identity, max = 158): string {
  const bio = identity.bio?.replace(/\s+/g, ' ').trim()
  if (!bio) {
    return [identity.headline, `Based in ${identity.locality}, ${identity.countryName}.`]
      .filter(Boolean)
      .join('. ')
  }

  if (bio.length <= max) return bio

  // Accumulate whole sentences while they fit.
  //
  // Splitting naively on /[.!?]/ is wrong here: it breaks inside "ASP.NET" and
  // "B.Sc.", which are exactly the strings this bio contains, and produced
  // truncations like "He works primarily with ASP." Requiring whitespace AND a
  // following capital means an intra-word period never counts as a boundary,
  // and "B.Sc. in Computer Science" stays intact because "in" is lowercase.
  const sentences = bio.split(/(?<=[.!?])\s+(?=[A-Z])/)
  if (sentences.length > 1) {
    let out = ''
    for (const sentence of sentences) {
      const next = out ? `${out} ${sentence}` : sentence
      if (next.length > max) break
      out = next
    }
    if (out.length >= max * 0.5) return out
  }

  // One very long opening sentence: trim on a word boundary.
  const cut = bio.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/**
 * Keywords, derived from what Identity actually claims.
 *
 * Note this is emitted only because there is a Sanity field for it. Google has
 * ignored the keywords meta tag since 2009 and so does Bing; it changes
 * nothing about ranking.
 */
export function deriveKeywords(identity: Identity): string[] {
  const place = identity.locality
  return [
    identity.fullName,
    ...identity.jobTitles.map((t) => `${t} ${place}`.trim()),
    ...identity.knowsAbout.slice(0, 8),
  ]
    .map((k) => k.trim())
    .filter(Boolean)
}
