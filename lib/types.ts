// ─── Shared Type Definitions ─────────────────────────────────────────────────
// Single source of truth for all shared interfaces.

// ── Landing / Hero ───────────────────────────────────────────────────────────

export interface LandingPageData {
  heroName: string
  heroRole: string
  heroSubtitle: string
  heroLocation: string
  profilePicUrl?: string
  certifications: string[]
  skills: string[]
  cvUrl?: string
}

// ── Navigation / Menu ────────────────────────────────────────────────────────

export interface NavLink {
  label: string
  href: string
}

export interface SocialLink {
  platform: string
  url: string
}

export interface MenuData {
  brandFirst: string
  brandLast: string
  email: string
  navLinks: NavLink[]
  socialLinks: SocialLink[]
}

// ── About Slides ─────────────────────────────────────────────────────────────

export interface AboutSlide {
  id: string
  tag: string
  outlineText: string
  title: string
  description: string
  timelinePoints: string[]
  order: number
  logoUrl?: string
}

// ── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  slug: string
  title: string
  /** One-or-two-sentence prose summary. Falls back to `description`. */
  summary: string
  description: string
  /** Portable Text blocks for the long write-up. */
  body?: unknown[] | null
  image: string
  imageAlt?: string
  tags: string[]
  category: string
  /** Free-text display date, e.g. "June 2026". */
  date: string
  /** Machine-readable ISO date, drives sitemap lastmod. */
  publishedAt?: string | null
  updatedAt?: string | null
  duration: string
  role?: string
  highlights: string[]
  features: string[]
  githubUrl: string
  projectUrl: string
  isLive: boolean
  type: 'application' | 'website' | 'api' | 'tool' | 'case-study' | 'research'
  seo?: PageSeo | null
}

export interface ProjectStats {
  totalProjects: number
  totalTechnologies: number
  categories: { category: string; count: number }[]
  averageDuration: string
}

// ── SEO ──────────────────────────────────────────────────────────────────────

export interface PageSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  ogImageUrl?: string | null
  noIndex?: boolean | null
}

export interface SiteSettings {
  /**
   * null means "derive from Identity". Only a non-empty string here is treated
   * as an explicit override. See lib/seo/derive.ts.
   */
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  ogImageUrl: string
  twitterHandle?: string | null
  llmsIntro?: string | null
  allowAiCrawlers: boolean
  googleSiteVerification?: string | null
  bingSiteVerification?: string | null
}

export interface EducationEntry {
  degree: string
  institution: string
  institutionUrl?: string | null
  locality?: string | null
  countryCode?: string | null
  startYear?: number | null
  endYear?: number | null
  note?: string | null
}

export interface CertificationEntry {
  name: string
  issuer: string
  issuerUrl?: string | null
  year?: number | null
  credentialUrl?: string | null
}

export interface Employer {
  name?: string | null
  url?: string | null
  role?: string | null
  startDate?: string | null
  summary?: string | null
}

/**
 * The canonical identity facts. Feeds Person JSON-LD, /llms.txt and humans.txt.
 * Must not contradict the visible page copy.
 */
export interface Identity {
  fullName: string
  givenName: string
  familyName: string
  alternateNames: string[]
  headline: string
  bio: string
  profileImageUrl?: string | null
  locality: string
  region?: string | null
  countryName: string
  countryCode: string
  geo?: { lat: number; lng: number } | null
  nationality?: string | null
  languages: string[]
  jobTitles: string[]
  knowsAbout: string[]
  currentEmployer?: Employer | null
  education: EducationEntry[]
  certifications: CertificationEntry[]
  email: string
  telephone?: string | null
  sameAs: string[]
  openToWork: boolean
  seeksRoles: string[]
  seeksLocations: string[]
}

export interface Faq {
  question: string
  answer: string
  order: number
}

// ── Editable UI labels ───────────────────────────────────────────────────────

/**
 * Every fixed piece of interface copy on the site.
 *
 * Section headings, button labels, column captions, empty states. Anything a
 * visitor reads that is not itself content lives here, so it can be changed in
 * Sanity without touching code.
 *
 * Blank fields fall back to the values in `defaultUiText`, so an empty
 * document renders exactly what the site renders today. Layout, sizing and
 * styling are not configurable by design: this changes wording only.
 */
export interface UiText {
  hero: {
    certificationsLabel: string
    skillsLabel: string
    viewWorkLabel: string
    downloadCvLabel: string
    openMenuLabel: string
  }
  nav: {
    closeMenuLabel: string
  }
  about: {
    headingLine1: string
    headingLine2: string
    scrollHint: string
  }
  featured: {
    sectionLabel: string
    techStackLabel: string
    overviewLabel: string
    githubLabel: string
    liveSiteLabel: string
    viewAllLabel: string
    loadingLabel: string
  }
  projects: {
    sectionLabel: string
    categoryLabel: string
    techStackLabel: string
    overviewLabel: string
    caseStudyLabel: string
    githubLabel: string
    liveSiteLabel: string
    emptyMessage: string
    dragHint: string
    loadingLabel: string
    statsProjectsLabel: string
    statsTechsLabel: string
    allProjectsHeading: string
  }
  projectDetail: {
    backLabel: string
    highlightsLabel: string
    techStackLabel: string
    liveSiteLabel: string
    sourceLabel: string
    roleLabel: string
    categoryLabel: string
    durationLabel: string
    dateLabel: string
  }
  faq: {
    headingLine1: string
    headingLine2: string
  }
  contact: {
    headingLine1: string
    headingLine2: string
    /** Blank uses the hero location verbatim. */
    locationLabel: string
    emailLabel: string
    availabilityLabel: string
    availabilityText: string
  }
  notFound: {
    heading: string
    body: string
    homeLabel: string
    projectsLabel: string
  }
  loadingScreen: {
    stage1: string
    stage2: string
    stage3: string
    stage4: string
    stageComplete: string
    bypassLabel: string
    bypassingLabel: string
    grantedLabel: string
  }
}
