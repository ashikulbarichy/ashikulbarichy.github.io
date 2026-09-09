import type { Identity, Faq, Project, SiteSettings } from '@/lib/types'
import { ID, SITE_NAME, SITE_URL, absoluteUrl } from './site'

type Json = Record<string, unknown>

/** Drop null/undefined/empty-array values so the output stays clean. */
function prune<T extends Json>(obj: T): T {
  const out: Json = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v
  }
  return out as T
}

function postalAddress(identity: Identity) {
  return prune({
    '@type': 'PostalAddress',
    addressLocality: identity.locality,
    addressRegion: identity.region,
    addressCountry: identity.countryCode,
  })
}

/**
 * Person — the main entity of the site.
 *
 * Everything here comes from the `identity` document in Sanity, so editing
 * Sanity changes what Google's Knowledge Graph and AI assistants read. Fields
 * are omitted rather than guessed: an absent claim is always better than a
 * wrong one.
 */
export function personJsonLd(identity: Identity): Json {
  const employer = identity.currentEmployer
  const image = identity.profileImageUrl ? absoluteUrl(identity.profileImageUrl) : null

  return prune({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': ID.person,
    name: identity.fullName,
    givenName: identity.givenName,
    familyName: identity.familyName,
    alternateName: identity.alternateNames.length === 1
      ? identity.alternateNames[0]
      : identity.alternateNames,
    url: `${SITE_URL}/`,
    image: image ? { '@type': 'ImageObject', url: image } : null,
    sameAs: identity.sameAs,
    jobTitle: identity.jobTitles,
    description: identity.bio,
    email: identity.email,
    telephone: identity.telephone,
    address: postalAddress(identity),
    homeLocation: prune({ '@type': 'Place', address: postalAddress(identity) }),
    nationality: identity.nationality
      ? { '@type': 'Country', name: identity.nationality }
      : null,
    knowsLanguage: identity.languages,
    knowsAbout: identity.knowsAbout,
    worksFor: employer?.name
      ? prune({ '@type': 'Organization', name: employer.name, url: employer.url })
      : null,
    hasOccupation: identity.jobTitles[0]
      ? prune({
          '@type': 'Occupation',
          name: identity.jobTitles[0],
          occupationLocation: prune({
            '@type': 'City',
            name: identity.locality,
            containedInPlace: { '@type': 'Country', name: identity.countryName },
          }),
          skills: identity.knowsAbout.join(', '),
        })
      : null,
    alumniOf: identity.education.map((e) =>
      prune({
        '@type': 'CollegeOrUniversity',
        name: e.institution,
        url: e.institutionUrl,
        address: prune({
          '@type': 'PostalAddress',
          addressLocality: e.locality,
          addressCountry: e.countryCode,
        }),
        description: [
          e.degree,
          e.startYear && e.endYear ? `${e.startYear}–${e.endYear}` : e.endYear,
        ]
          .filter(Boolean)
          .join(', '),
      })
    ),
    hasCredential: identity.certifications.map((c) =>
      prune({
        '@type': 'EducationalOccupationalCredential',
        name: c.name,
        credentialCategory: 'Certificate',
        url: c.credentialUrl,
        recognizedBy: prune({ '@type': 'Organization', name: c.issuer, url: c.issuerUrl }),
      })
    ),
    seeks:
      identity.openToWork && identity.seeksRoles.length
        ? prune({
            '@type': 'Demand',
            name: `${identity.seeksRoles.join(', ')} roles`,
            areaServed: identity.seeksLocations.map((name) => ({ '@type': 'Place', name })),
          })
        : null,
  })
}

export function webSiteJsonLd(settings: SiteSettings): Json {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': ID.website,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: `${SITE_NAME} Portfolio`,
    description: settings.seoDescription,
    inLanguage: 'en',
    author: { '@id': ID.person },
    publisher: { '@id': ID.person },
    copyrightHolder: { '@id': ID.person },
  })
}

export function profilePageJsonLd(dateModified?: string | null): Json {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': ID.profilePage,
    url: `${SITE_URL}/`,
    isPartOf: { '@id': ID.website },
    mainEntity: { '@id': ID.person },
    dateModified: dateModified ?? new Date().toISOString(),
  })
}

/**
 * FAQPage.
 *
 * Only emit this when the same questions and answers are visible on the page.
 * Google treats FAQ markup that is not visible to a visitor as a structured
 * data violation, and an AI assistant cannot verify what it cannot read.
 */
export function faqJsonLd(faqs: Faq[]): Json | null {
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': ID.faq,
    isPartOf: { '@id': ID.website },
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function breadcrumbJsonLd(
  trail: { name: string; path: string }[]
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function collectionPageJsonLd(opts: {
  path: string
  name: string
  description: string
  items: Project[]
}): Json {
  return prune({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(opts.path)}#webpage`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    inLanguage: 'en',
    isPartOf: { '@id': ID.website },
    author: { '@id': ID.person },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(`/projects/${p.slug}`),
        name: p.title,
      })),
    },
  })
}

/**
 * A single project, as a CreativeWork.
 *
 * `SoftwareApplication` is tempting but it expects an app you can install or
 * run, and Google is strict about its required fields. CreativeWork is the
 * honest shape for portfolio work.
 */
export function projectJsonLd(project: Project, identity: Identity): Json {
  const url = absoluteUrl(`/projects/${project.slug}`)
  return prune({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${url}#work`,
    url,
    name: project.title,
    headline: project.title,
    description: project.summary || project.description,
    inLanguage: 'en',
    isPartOf: { '@id': ID.website },
    author: { '@id': ID.person },
    creator: { '@id': ID.person },
    image: project.image || null,
    keywords: project.tags.length ? project.tags.join(', ') : null,
    genre: project.category,
    datePublished: project.publishedAt,
    dateModified: project.updatedAt,
    about: project.tags.map((t) => ({ '@type': 'Thing', name: t })),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${url}#webpage` },
    sameAs: [project.projectUrl, project.githubUrl].filter(Boolean),
    creditText: `${project.title} by ${identity.fullName}`,
  })
}

/** Serialise for embedding in a <script type="application/ld+json"> tag. */
export function jsonLdScript(data: Json | Json[] | null): string {
  if (!data) return ''
  // `<` is escaped so a value containing "</script>" cannot break out of the tag.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
