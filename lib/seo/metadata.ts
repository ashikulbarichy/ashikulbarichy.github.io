import type { Metadata } from 'next'
import type { Identity, SiteSettings, PageSeo } from '@/lib/types'
import { SITE_NAME, SITE_URL, absoluteUrl, clampDescription } from './site'
import { deriveTitle, deriveDescription, deriveKeywords } from './derive'

interface BuildArgs {
  settings: SiteSettings
  identity: Identity
  /** Path of the page, e.g. '/' or '/projects/foo'. Drives the canonical URL. */
  path: string
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  imageAlt?: string | null
  type?: 'website' | 'profile' | 'article'
  noIndex?: boolean | null
  publishedTime?: string | null
  modifiedTime?: string | null
}

/**
 * Build a Next.js Metadata object from Sanity data.
 *
 * Everything a crawler reads in <head> flows through here, so there is exactly
 * one place where canonical URLs, OG tags and robots directives are decided.
 */
export function buildMetadata({
  settings,
  identity,
  path,
  title,
  description,
  imageUrl,
  imageAlt,
  type = 'website',
  noIndex = false,
  publishedTime,
  modifiedTime,
}: BuildArgs): Metadata {
  const canonical = absoluteUrl(path)

  // Resolution order, most specific first:
  //   1. what this page passed in
  //   2. an explicit override typed into Sanity siteSettings
  //   3. derived from Identity
  //
  // Step 3 is what makes the metadata track your content: clear the field in
  // Sanity and the title/description recompute from Identity whenever you edit
  // it, instead of holding a value that has to be remembered separately.
  const resolvedTitle = title?.trim() || settings.seoTitle?.trim() || deriveTitle(identity)
  const resolvedDescription = clampDescription(
    description?.trim() || settings.seoDescription?.trim() || deriveDescription(identity)
  )
  const ogImage = absoluteUrl(imageUrl || settings.ogImageUrl)
  const ogAlt = imageAlt || `${identity.fullName} — ${identity.headline}`

  const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: resolvedTitle,
    description: resolvedDescription,
    applicationName: SITE_NAME,
    authors: [{ name: identity.fullName, url: `${SITE_URL}/` }],
    creator: identity.fullName,
    publisher: identity.fullName,

    alternates: { canonical },

    // A noindex page must not be crawled OR followed into, and must stay out
    // of the sitemap (see app/sitemap.ts, which filters on the same flag).
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },

    openGraph: {
      type: type === 'article' ? 'article' : type,
      url: canonical,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description: resolvedDescription,
      locale: 'en_US',
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
      ...(type === 'article' && {
        publishedTime: publishedTime ?? undefined,
        modifiedTime: modifiedTime ?? undefined,
        authors: [`${SITE_URL}/`],
      }),
    },

    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImage],
      // Only emitted when a handle is actually configured. Pointing at an
      // account that does not exist is worse than omitting the tag.
      ...(settings.twitterHandle
        ? { site: settings.twitterHandle, creator: settings.twitterHandle }
        : {}),
    },

    keywords: settings.seoKeywords
      ? settings.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
      : deriveKeywords(identity),

    other: {
      // Subdivision codes are only emitted when Identity supplies one that
      // already looks like an ISO 3166-2 code (e.g. "BD-13"). Otherwise just
      // the country: a guessed subdivision is a wrong claim, and this tag is
      // low-value enough that omitting the detail costs nothing.
      'geo.region': /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(identity.region ?? '')
        ? (identity.region as string)
        : identity.countryCode,
      'geo.placename': `${identity.locality}, ${identity.countryName}`,
      ...(identity.geo
        ? {
            'geo.position': `${identity.geo.lat};${identity.geo.lng}`,
            ICBM: `${identity.geo.lat}, ${identity.geo.lng}`,
          }
        : {}),
    },
  }

  const verification: Record<string, string> = {}
  if (settings.googleSiteVerification) verification.google = settings.googleSiteVerification
  if (settings.bingSiteVerification) verification.other = settings.bingSiteVerification
  if (Object.keys(verification).length) {
    metadata.verification = {
      google: settings.googleSiteVerification ?? undefined,
      other: settings.bingSiteVerification
        ? { 'msvalidate.01': settings.bingSiteVerification }
        : undefined,
    }
  }

  return metadata
}

/** Apply a document's per-page SEO overrides on top of the defaults. */
export function withPageSeo(
  args: BuildArgs,
  seo: PageSeo | null | undefined
): Metadata {
  if (!seo) return buildMetadata(args)
  return buildMetadata({
    ...args,
    title: seo.metaTitle || args.title,
    description: seo.metaDescription || args.description,
    imageUrl: seo.ogImageUrl || args.imageUrl,
    noIndex: seo.noIndex ?? args.noIndex,
  })
}
