import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import FaqSection from '@/components/sections/FaqSection'
import {
  getIdentity,
  getSiteSettings,
  getFaqs,
  getUiText,
} from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo/metadata'
import { faqJsonLd, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo/jsonld'

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
 * /faq
 *
 * Moved off the homepage at the owner's request. It keeps its own URL rather
 * than being deleted for two reasons:
 *
 *   1. FAQPage structured data is only valid where the same Q&A is visible to
 *      a visitor. Hiding the text and keeping the markup is a structured data
 *      violation, so the choice is "visible somewhere" or "no markup at all".
 *   2. These questions are phrased the way people actually search ("who is
 *      <name>?"), which makes this page a direct answer target for entity
 *      queries — the kind of thing an AI assistant quotes.
 *
 * Note on value: Google restricted FAQ *rich results* to government and health
 * sites in 2023, so do not expect the expandable snippet in search. The value
 * here is the prose itself, plus the same content served at /llms.txt.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [settings, identity, faqs] = await Promise.all([
    getSiteSettings(),
    getIdentity(),
    getFaqs(),
  ])

  const description = faqs.length
    ? `Answers to common questions about ${identity.fullName} — ${identity.headline.toLowerCase()} in ${identity.locality}, ${identity.countryName}.`
    : `About ${identity.fullName}.`

  return buildMetadata({
    settings,
    identity,
    path: '/faq',
    title: `FAQ — ${identity.fullName}`,
    description,
    type: 'website',
    // Nothing to show if the FAQ list is empty; do not offer an empty page to
    // the index.
    noIndex: faqs.length === 0,
  })
}

export default async function FaqPage() {
  const [faqs, ui] = await Promise.all([getFaqs(), getUiText()])

  const graph = [
    faqJsonLd(faqs),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'FAQ', path: '/faq' },
    ]),
  ].filter(Boolean) as Record<string, unknown>[]

  return (
    <>
      {graph.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(node) }}
        />
      ))}

      <div className="min-h-screen bg-black pt-28 md:pt-36">
        <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-4xl px-6 sm:px-10 md:px-16">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" />
            <span>{ui.notFound.homeLabel}</span>
          </Link>
        </nav>

        <FaqSection faqs={faqs} ui={ui} />
      </div>
    </>
  )
}
