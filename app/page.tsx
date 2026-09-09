import type { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import FeaturedProjects from '@/components/sections/FeaturedProjects'
import ContactMe from '@/components/sections/ContactMe'
import {
  getIdentity,
  getSiteSettings,
  getLandingData,
  getMenuData,
  getAboutSlides,
  getFeaturedProjects,
  getUiText,
} from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo/metadata'
import {
  profilePageJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
} from '@/lib/seo/jsonld'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, identity] = await Promise.all([getSiteSettings(), getIdentity()])
  return buildMetadata({
    settings,
    identity,
    path: '/',
    type: 'profile',
    imageAlt: `${identity.fullName} — ${identity.headline}`,
  })
}

export default async function HomePage() {
  // One parallel fetch on the server. Everything below renders with real data
  // already in hand, so the hero copy, about slides, project cards and FAQ are
  // all present in the initial HTML.
  const [landingData, menuData, aboutSlides, featured, ui] = await Promise.all([
    getLandingData(),
    getMenuData(),
    getAboutSlides(),
    getFeaturedProjects(),
    getUiText(),
  ])

  // FAQPage JSON-LD deliberately lives on /faq, not here: the markup is only
  // legitimate on a page where the same Q&A is visible to a visitor.
  const graph = [
    profilePageJsonLd(),
    breadcrumbJsonLd([{ name: 'Home', path: '/' }]),
  ]

  return (
    <>
      {graph.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(node) }}
        />
      ))}

      <Hero landingData={landingData} menuData={menuData} ui={ui} />
      <About slides={aboutSlides} ui={ui} />
      <FeaturedProjects projects={featured} ui={ui} />
      <ContactMe landingData={landingData} menuData={menuData} ui={ui} />
    </>
  )
}
