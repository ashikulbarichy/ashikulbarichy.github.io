import type { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'
import { SITE_URL } from '@/lib/seo/site'

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

/**
 * AI crawler user-agents.
 *
 * robots.txt is the ONLY control surface these bots read. The old site also
 * carried tags like <meta name="GPTBot" content="index, follow">, which no
 * crawler looks for — a meta tag named after a bot does nothing. Access is
 * granted or refused here.
 *
 * Toggled by `allowAiCrawlers` in Sanity site settings.
 */
const AI_CRAWLERS = [
  // OpenAI
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  // Anthropic
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  // Google AI (separate from Googlebot: this governs Gemini and AI Overviews)
  'Google-Extended',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Apple
  'Applebot-Extended',
  // Meta
  'meta-externalagent',
  'FacebookBot',
  // Common Crawl — training corpus for many models
  'CCBot',
  // Others
  'cohere-ai',
  'YouBot',
  'Diffbot',
  'Bytespider',
  'Amazonbot',
]

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings()

  return {
    rules: [
      {
        // Conventional search engines. `/api/` is excluded because the
        // revalidation webhook has no business being crawled.
        userAgent: '*',
        allow: '/',
        // /sam is the private analytics dashboard. It is also noindex'd at the
        // page level and via an X-Robots-Tag header from middleware — robots.txt
        // alone is a request, not an access control.
        disallow: ['/api/', '/sam'],
      },
      {
        userAgent: AI_CRAWLERS,
        ...(settings.allowAiCrawlers
          ? { allow: '/', disallow: ['/api/', '/sam'] }
          : { disallow: '/' }),
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
