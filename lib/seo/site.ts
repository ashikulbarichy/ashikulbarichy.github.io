/**
 * Canonical site constants.
 *
 * SITE_URL is the single host every canonical, OG url, sitemap entry and
 * JSON-LD @id is built from. It must match the host the site actually serves
 * on, with no redirect in between: the previous version canonicalised to
 * https://ashikulbari.com while the apex 308-redirected to www, which tells a
 * crawler the canonical URL is not the real one.
 *
 * To switch to the apex domain, change this to 'https://ashikulbari.com' AND
 * flip the redirect in your Vercel domain settings so www points at apex.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ashikulbari.com'
).replace(/\/$/, '')

export const SITE_NAME = 'Ashikul Bari Chowdhury'

/** Stable JSON-LD node identifiers. Reused across pages so nodes link up. */
export const ID = {
  person: `${SITE_URL}/#person`,
  website: `${SITE_URL}/#website`,
  profilePage: `${SITE_URL}/#profilepage`,
  faq: `${SITE_URL}/#faq`,
  breadcrumbHome: `${SITE_URL}/#breadcrumb`,
} as const

export const absoluteUrl = (path = '/') =>
  path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

/** Trim to a length that will not be truncated in a search result. */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
