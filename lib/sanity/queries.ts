import { unstable_cache } from 'next/cache'
import { client, urlForSized } from './client'
import {
  defaultIdentity,
  defaultSiteSettings,
  defaultLandingData,
  defaultMenuData,
  defaultAboutSlides,
  defaultFaqs,
  defaultUiText,
} from './fallbacks'
import type {
  Identity,
  SiteSettings,
  LandingPageData,
  MenuData,
  AboutSlide,
  Project,
  Faq,
  UiText,
} from '@/lib/types'

/**
 * Cache tags.
 *
 * Every query is wrapped in `unstable_cache` and tagged. The Sanity webhook at
 * /api/revalidate calls `revalidateTag` with the tag matching the document type
 * that changed, so publishing in the Studio refreshes the affected pages within
 * seconds without a redeploy.
 *
 * `unstable_cache` (rather than fetch tags) is required because @sanity/client
 * does not route through Next's instrumented `fetch`.
 */
export const TAGS = {
  all: 'sanity',
  identity: 'identity',
  siteSettings: 'siteSettings',
  hero: 'hero',
  menu: 'menu',
  aboutSlide: 'aboutSlide',
  project: 'project',
  faq: 'faq',
  uiText: 'uiText',
} as const

/**
 * Backstop revalidation window.
 *
 * The webhook is the fast path — it invalidates by tag within seconds of a
 * publish. This is what happens when the webhook is not configured, or its
 * delivery failed: content still refreshes, just on a timer.
 *
 * Originally 3600 (one hour), which was far too long. Publishing in the Studio
 * and seeing nothing change for an hour reads as "the site is broken", and the
 * cost of a shorter window is negligible here: reads go through Sanity's CDN,
 * this is a low-traffic portfolio, and one query per minute per cached entry
 * is nothing. 60s means the site is never meaningfully stale even with the
 * webhook switched off entirely.
 */
const REVALIDATE_SECONDS = 30

function cached<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  tags: string[]
): () => Promise<T> {
  return unstable_cache(fn, keyParts, { tags: [TAGS.all, ...tags], revalidate: REVALIDATE_SECONDS })
}

// ─────────────────────────────────────────────────────────────
// Identity
// ─────────────────────────────────────────────────────────────

const IDENTITY_QUERY = `*[_type == "identity"][0]{
  fullName, givenName, familyName, alternateNames, headline, bio,
  profileImage, locality, region, countryName, countryCode, geo,
  nationality, languages, jobTitles, knowsAbout,
  currentEmployer, education, certifications,
  email, telephone, sameAs, openToWork, seeksRoles, seeksLocations
}`

export const getIdentity = cached(
  async (): Promise<Identity> => {
    if (!client) return defaultIdentity
    try {
      const d = await client.fetch<Record<string, any> | null>(IDENTITY_QUERY)
      if (!d) {
        console.warn(
          '[sanity] no `identity` document — serving the code fallback. Run: node scripts/seed-seo.mjs'
        )
        return defaultIdentity
      }
      const gaps = identityGaps(d)
      if (gaps.length) {
        console.warn(
          `[sanity] identity is incomplete, these fall back to code defaults: ${gaps.join(', ')}. ` +
            'Mixing live and fallback values can make the Person schema self-contradictory.'
        )
      }
      return {
        fullName: d.fullName || defaultIdentity.fullName,
        givenName: d.givenName || defaultIdentity.givenName,
        familyName: d.familyName || defaultIdentity.familyName,
        alternateNames: d.alternateNames ?? defaultIdentity.alternateNames,
        headline: d.headline || defaultIdentity.headline,
        bio: d.bio || defaultIdentity.bio,
        profileImageUrl: d.profileImage
          ? urlForSized(d.profileImage, 1200)
          : defaultIdentity.profileImageUrl,
        locality: d.locality || defaultIdentity.locality,
        region: d.region ?? defaultIdentity.region,
        countryName: d.countryName || defaultIdentity.countryName,
        countryCode: (d.countryCode || defaultIdentity.countryCode).toUpperCase(),
        geo: d.geo?.lat != null ? { lat: d.geo.lat, lng: d.geo.lng } : defaultIdentity.geo,
        nationality: d.nationality ?? defaultIdentity.nationality,
        languages: d.languages ?? defaultIdentity.languages,
        jobTitles: d.jobTitles?.length ? d.jobTitles : defaultIdentity.jobTitles,
        knowsAbout: d.knowsAbout?.length ? d.knowsAbout : defaultIdentity.knowsAbout,
        currentEmployer: d.currentEmployer?.name ? d.currentEmployer : defaultIdentity.currentEmployer,
        education: d.education?.length ? d.education : defaultIdentity.education,
        certifications: d.certifications?.length ? d.certifications : defaultIdentity.certifications,
        email: d.email || defaultIdentity.email,
        telephone: d.telephone ?? null,
        sameAs: (d.sameAs ?? defaultIdentity.sameAs).filter(Boolean),
        openToWork: d.openToWork ?? defaultIdentity.openToWork,
        seeksRoles: d.seeksRoles ?? defaultIdentity.seeksRoles,
        seeksLocations: d.seeksLocations ?? defaultIdentity.seeksLocations,
      }
    } catch (err) {
      console.error('[sanity] identity fetch failed, using fallback:', err)
      return defaultIdentity
    }
  },
  ['identity'],
  [TAGS.identity]
)

/**
 * Which Identity fields are empty and therefore falling back to code.
 *
 * A partially-filled document is the worst case, not a harmless one: it mixes
 * live values with defaults, so the Person JSON-LD can end up with a `name`
 * from Sanity and a `description` from the fallback that spell the name
 * differently. That is precisely the contradiction the whole identity model
 * exists to avoid.
 *
 * Reported by /api/sam/diag and logged on a cache miss.
 */
export function identityGaps(d: Record<string, unknown> | null): string[] {
  if (!d) return ['document missing entirely']
  const gaps: string[] = []
  const str = (k: string) => typeof d[k] === 'string' && (d[k] as string).trim().length > 0
  const arr = (k: string) => Array.isArray(d[k]) && (d[k] as unknown[]).length > 0

  if (!str('fullName')) gaps.push('fullName')
  else if (!(d.fullName as string).trim().includes(' ')) gaps.push('fullName (looks like a first name only)')
  if (!str('bio')) gaps.push('bio')
  if (!str('headline')) gaps.push('headline')
  if (!str('locality')) gaps.push('locality')
  if (!str('countryName')) gaps.push('countryName')
  if (!str('countryCode')) gaps.push('countryCode')
  if (!str('email')) gaps.push('email')
  if (!arr('jobTitles')) gaps.push('jobTitles')
  if (!arr('knowsAbout')) gaps.push('knowsAbout')
  if (!arr('sameAs')) gaps.push('sameAs')
  if (!arr('education')) gaps.push('education')
  return gaps
}

// ─────────────────────────────────────────────────────────────
// Site settings
// ─────────────────────────────────────────────────────────────

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  seoTitle, seoDescription, seoKeywords, ogImage, twitterHandle,
  llmsIntro, allowAiCrawlers, googleSiteVerification, bingSiteVerification
}`

export const getSiteSettings = cached(
  async (): Promise<SiteSettings> => {
    if (!client) return defaultSiteSettings
    try {
      const d = await client.fetch<Record<string, any> | null>(SITE_SETTINGS_QUERY)
      if (!d) return defaultSiteSettings
      return {
        // Blank on purpose stays blank: buildMetadata derives these from
        // Identity, so clearing the field in Sanity is how you opt into
        // automatic titles rather than getting a stale hardcoded one.
        seoTitle: d.seoTitle?.trim() || null,
        seoDescription: d.seoDescription?.trim() || null,
        seoKeywords: d.seoKeywords?.trim() || null,
        ogImageUrl: d.ogImage
          ? urlForSized(d.ogImage, 1200, 630)
          : defaultSiteSettings.ogImageUrl,
        twitterHandle: d.twitterHandle ?? null,
        llmsIntro: d.llmsIntro ?? null,
        allowAiCrawlers: d.allowAiCrawlers ?? true,
        googleSiteVerification: d.googleSiteVerification ?? null,
        bingSiteVerification: d.bingSiteVerification ?? null,
      }
    } catch (err) {
      console.error('[sanity] siteSettings fetch failed, using fallback:', err)
      return defaultSiteSettings
    }
  },
  ['siteSettings'],
  [TAGS.siteSettings]
)

// ─────────────────────────────────────────────────────────────
// Hero / landing
// ─────────────────────────────────────────────────────────────

const HERO_QUERY = `*[_type == "hero"][0]{
  heroName, heroRole, heroSubtitle, heroLocation,
  profilePic, cvUrl, certifications, skills
}`

export const getLandingData = cached(
  async (): Promise<LandingPageData> => {
    if (!client) return defaultLandingData
    try {
      const d = await client.fetch<Record<string, any> | null>(HERO_QUERY)
      if (!d) return defaultLandingData
      return {
        heroName: d.heroName || defaultLandingData.heroName,
        heroRole: d.heroRole || defaultLandingData.heroRole,
        heroSubtitle: d.heroSubtitle || defaultLandingData.heroSubtitle,
        heroLocation: d.heroLocation || defaultLandingData.heroLocation,
        profilePicUrl: d.profilePic
          ? urlForSized(d.profilePic, 640)
          : defaultLandingData.profilePicUrl,
        certifications: d.certifications ?? defaultLandingData.certifications,
        skills: d.skills ?? defaultLandingData.skills,
        cvUrl: d.cvUrl || defaultLandingData.cvUrl,
      }
    } catch (err) {
      console.error('[sanity] hero fetch failed, using fallback:', err)
      return defaultLandingData
    }
  },
  ['hero'],
  [TAGS.hero]
)

// ─────────────────────────────────────────────────────────────
// Menu
// ─────────────────────────────────────────────────────────────

const MENU_QUERY = `*[_type == "menu"][0]{
  brandFirst, brandLast, email, navLinks, socialLinks[]{platform, url}
}`

export const getMenuData = cached(
  async (): Promise<MenuData> => {
    if (!client) return defaultMenuData
    try {
      const d = await client.fetch<Record<string, any> | null>(MENU_QUERY)
      if (!d) return defaultMenuData
      return {
        brandFirst: d.brandFirst || defaultMenuData.brandFirst,
        brandLast: d.brandLast ?? defaultMenuData.brandLast,
        email: d.email || defaultMenuData.email,
        navLinks: d.navLinks?.length ? d.navLinks : defaultMenuData.navLinks,
        socialLinks: d.socialLinks?.length ? d.socialLinks : defaultMenuData.socialLinks,
      }
    } catch (err) {
      console.error('[sanity] menu fetch failed, using fallback:', err)
      return defaultMenuData
    }
  },
  ['menu'],
  [TAGS.menu]
)

// ─────────────────────────────────────────────────────────────
// About slides
// ─────────────────────────────────────────────────────────────

const ABOUT_QUERY = `*[_type == "aboutSlide"] | order(order asc){
  id, tag, outlineText, title, description, timelinePoints, order, logo
}`

export const getAboutSlides = cached(
  async (): Promise<AboutSlide[]> => {
    if (!client) return defaultAboutSlides
    try {
      const rows = await client.fetch<Record<string, any>[]>(ABOUT_QUERY)
      if (!rows?.length) return defaultAboutSlides
      return rows.map((d, i) => ({
        id: d.id || String(i + 1).padStart(2, '0'),
        tag: d.tag || '',
        outlineText: d.outlineText || '',
        title: d.title || '',
        description: d.description || '',
        timelinePoints: d.timelinePoints ?? [],
        order: d.order ?? i + 1,
        logoUrl: d.logo ? urlForSized(d.logo, 256) : undefined,
      }))
    } catch (err) {
      console.error('[sanity] aboutSlide fetch failed, using fallback:', err)
      return defaultAboutSlides
    }
  },
  ['aboutSlides'],
  [TAGS.aboutSlide]
)

// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────

const FAQ_QUERY = `*[_type == "faq" && hidden != true] | order(order asc){ question, answer, order }`

export const getFaqs = cached(
  async (): Promise<Faq[]> => {
    if (!client) return defaultFaqs
    try {
      const rows = await client.fetch<Faq[]>(FAQ_QUERY)
      return rows?.length ? rows : defaultFaqs
    } catch (err) {
      console.error('[sanity] faq fetch failed, using fallback:', err)
      return defaultFaqs
    }
  },
  ['faqs'],
  [TAGS.faq]
)

// ─────────────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────────────

const PROJECT_FIELDS = `
  "id": _id,
  "slug": coalesce(slug.current, _id),
  title,
  "summary": coalesce(summary, description, ""),
  "description": coalesce(description, summary, ""),
  body,
  image,
  "imageAlt": image.alt,
  tags,
  category,
  date,
  publishedAt,
  "updatedAt": _updatedAt,
  duration,
  role,
  highlights,
  projectUrl,
  repoUrl,
  isLive,
  type,
  seo
`

function mapProject(d: Record<string, any>): Project {
  return {
    id: d.id,
    slug: d.slug,
    title: d.title || 'Untitled project',
    summary: d.summary || '',
    description: d.description || '',
    body: d.body ?? null,
    image: d.image ? urlForSized(d.image, 1600) : '',
    imageAlt: d.imageAlt || undefined,
    tags: d.tags ?? [],
    category: d.category || 'Other',
    date: d.date || '',
    publishedAt: d.publishedAt ?? null,
    updatedAt: d.updatedAt ?? null,
    duration: d.duration || '',
    role: d.role || undefined,
    highlights: d.highlights ?? [],
    features: d.highlights ?? [],
    githubUrl: d.repoUrl || '',
    projectUrl: d.projectUrl || '',
    isLive: Boolean(d.isLive),
    type: d.type || 'application',
    seo: d.seo
      ? {
          metaTitle: d.seo.metaTitle ?? null,
          metaDescription: d.seo.metaDescription ?? null,
          ogImageUrl: d.seo.ogImage ? urlForSized(d.seo.ogImage, 1200, 630) : null,
          noIndex: d.seo.noIndex ?? false,
        }
      : null,
  }
}

export const getProjects = cached(
  async (): Promise<Project[]> => {
    if (!client) return []
    try {
      const rows = await client.fetch<Record<string, any>[]>(
        `*[_type == "project"] | order(coalesce(publishedAt, _createdAt) desc){${PROJECT_FIELDS}}`
      )
      return (rows ?? []).map(mapProject)
    } catch (err) {
      console.error('[sanity] projects fetch failed:', err)
      return []
    }
  },
  ['projects'],
  [TAGS.project]
)

/** Projects that should appear in the sitemap and be indexed. */
export async function getIndexableProjects(): Promise<Project[]> {
  const all = await getProjects()
  return all.filter((p) => !p.seo?.noIndex)
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getProjects()
  return all.find((p) => p.slug === slug) ?? null
}

export const getFeaturedProjects = cached(
  async (): Promise<Project[]> => {
    if (!client) return []
    try {
      const rows = await client.fetch<Record<string, any>[]>(
        `*[_type == "hero"][0].featuredProjects[]->{${PROJECT_FIELDS}}`
      )
      if (rows?.length) return rows.filter(Boolean).map(mapProject)
    } catch (err) {
      console.error('[sanity] featuredProjects fetch failed:', err)
    }
    // No explicit selection: fall back to the three most recent.
    const all = await getProjects()
    return all.slice(0, 3)
  },
  ['featuredProjects'],
  [TAGS.hero, TAGS.project]
)

export async function getProjectCategories(): Promise<string[]> {
  const all = await getProjects()
  return Array.from(new Set(all.map((p) => p.category).filter(Boolean))).sort()
}

// ─────────────────────────────────────────────────────────────
// UI text
// ─────────────────────────────────────────────────────────────

const UI_TEXT_QUERY = `*[_type == "uiText"][0]{
  hero, nav, about, featured, projects, projectDetail, faq, contact, notFound,
  loadingScreen
}`

/**
 * Merge Sanity values over the defaults, one field at a time.
 *
 * A shallow spread would be wrong here: a `hero` group in Sanity with only
 * `skillsLabel` filled in would wipe out every other hero label. This walks
 * each group and takes the Sanity value only when it is a non-empty string,
 * so partially-filled groups behave the way an editor expects.
 */
export function mergeUiText(remote: Record<string, any> | null): UiText {
  if (!remote) return defaultUiText

  const out = {} as Record<string, Record<string, string>>
  for (const [group, defaults] of Object.entries(defaultUiText)) {
    const incoming = (remote[group] ?? {}) as Record<string, unknown>
    const merged: Record<string, string> = {}
    for (const [key, fallback] of Object.entries(defaults as Record<string, string>)) {
      const value = incoming[key]
      merged[key] = typeof value === 'string' && value.trim() ? value : fallback
    }
    out[group] = merged
  }
  return out as unknown as UiText
}

export const getUiText = cached(
  async (): Promise<UiText> => {
    if (!client) return defaultUiText
    try {
      const d = await client.fetch<Record<string, any> | null>(UI_TEXT_QUERY)
      return mergeUiText(d)
    } catch (err) {
      console.error('[sanity] uiText fetch failed, using defaults:', err)
      return defaultUiText
    }
  },
  ['uiText'],
  [TAGS.uiText]
)
