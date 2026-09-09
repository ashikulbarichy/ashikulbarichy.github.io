import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import AppShell from '@/components/AppShell'
import Analytics from '@/components/Analytics'
import { getIdentity, getSiteSettings, getUiText } from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo/metadata'
import { personJsonLd, webSiteJsonLd, jsonLdScript } from '@/lib/seo/jsonld'

/**
 * Root metadata.
 *
 * This runs on the server for every request, reads Sanity, and emits real
 * <title>, description, canonical and Open Graph tags into the initial HTML.
 * Editing Sanity changes what a crawler reads with no rebuild — the whole
 * reason for moving off the client-rendered Vite app, where every tag was
 * written by JavaScript after paint and never seen by GPTBot or ClaudeBot.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [settings, identity] = await Promise.all([getSiteSettings(), getIdentity()])
  return buildMetadata({ settings, identity, path: '/', type: 'profile' })
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, identity, ui] = await Promise.all([
    getSiteSettings(),
    getIdentity(),
    getUiText(),
  ])

  // Person and WebSite are site-wide entities, so they live in the layout and
  // every page links to them by @id rather than repeating them.
  const graph = [personJsonLd(identity), webSiteJsonLd(settings)]

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="author" href="/humans.txt" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />

        <meta name="theme-color" content="#3b82f6" />

        {graph.map((node, i) => (
          <script
            key={i}
            type="application/ld+json"
            // Server-rendered, from Sanity. jsonLdScript escapes '<' so a
            // value cannot terminate the script tag.
            dangerouslySetInnerHTML={{ __html: jsonLdScript(node) }}
          />
        ))}
      </head>
      <body>
        <AppShell loadingLabels={ui.loadingScreen}>{children}</AppShell>

        {/*
          First-party analytics, replacing Google Analytics.

          No third-party script, no cookies, and no cross-day identifier, which
          is why the site needs no consent banner. Wrapped in Suspense because
          it reads useSearchParams, which would otherwise opt every page out of
          static rendering.
        */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
