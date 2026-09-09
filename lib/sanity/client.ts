import { createClient, type SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2023-05-03'

export const isSanityConfigured = Boolean(projectId)

/**
 * Read-only Sanity client.
 *
 * Deliberately tokenless. The `production` dataset is public, so reads work
 * unauthenticated, and a token here would buy nothing while creating a leak
 * risk. Freshness comes from tag-based revalidation (see lib/sanity/queries.ts
 * and app/api/revalidate/route.ts), not from bypassing the cache.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
    })
  : null

const builder = client ? imageUrlBuilder(client) : null

type ImageSource = Parameters<NonNullable<typeof builder>['image']>[0]

/** Build a CDN URL for a Sanity image reference. Returns '' when unavailable. */
export function urlFor(source: ImageSource | null | undefined): string {
  if (!builder || !source) return ''
  try {
    return builder.image(source).auto('format').fit('max').url()
  } catch {
    return ''
  }
}

/** Same, but sized — use for anything that needs predictable dimensions. */
export function urlForSized(
  source: ImageSource | null | undefined,
  width: number,
  height?: number
): string {
  if (!builder || !source) return ''
  try {
    let b = builder.image(source).width(width).auto('format')
    if (height) b = b.height(height).fit('crop')
    return b.url()
  } catch {
    return ''
  }
}
