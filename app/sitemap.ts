import type { MetadataRoute } from 'next'
import { getIndexableProjects, getFaqs } from '@/lib/sanity/queries'
import { SITE_URL } from '@/lib/seo/site'

/**
 * Sitemap, generated from Sanity on every request (then cached).
 *
 * Add a project in the Studio and it appears here automatically with a real
 * lastmod. Notes on what is deliberately absent:
 *
 *   - No `changefreq` or `priority`. Google has stated it ignores both.
 *   - No fragment URLs (#about, #contact). Fragments are not separate pages
 *     and are invalid sitemap entries; the previous sitemap listed two.
 *   - Projects flagged noIndex in Sanity are excluded, matching the robots
 *     directive their page emits. A sitemap that lists a noindex page sends
 *     Search Console a contradiction.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, faqs] = await Promise.all([getIndexableProjects(), getFaqs()])

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.publishedAt || Date.now()),
  }))

  // The projects index is only as fresh as its newest project.
  const newestProject = projects
    .map((p) => p.updatedAt || p.publishedAt)
    .filter(Boolean)
    .sort()
    .reverse()[0]

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: new Date(newestProject || Date.now()),
    },
    // /faq sets noindex when it has no questions, so it must drop out of the
    // sitemap under the same condition rather than advertising an empty page.
    ...(faqs.length ? [{ url: `${SITE_URL}/faq`, lastModified: new Date() }] : []),
    ...projectEntries,
  ]
}
