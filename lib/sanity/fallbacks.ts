import type {
  Identity,
  LandingPageData,
  MenuData,
  AboutSlide,
  SiteSettings,
  Faq,
  UiText,
} from '@/lib/types'

/**
 * Fallbacks.
 *
 * Used when Sanity is unreachable or a field is empty. These must stay
 * consistent with the `identity` document in Sanity: if the two disagree, a
 * crawler that catches the fallback and a visitor who sees the live data get
 * different stories, which is the exact problem this migration set out to fix.
 *
 * Positioning note: "backend developer moving into GRC", not "cyber security
 * analyst". This matches the hero copy. Do not inflate it here.
 */

export const defaultIdentity: Identity = {
  fullName: 'Ashikul Bari Chowdhury',
  givenName: 'Ashikul',
  familyName: 'Bari Chowdhury',
  alternateNames: ['Ashikul Bari'],
  headline: 'ASP.NET API Developer, building toward GRC',
  bio:
    'Ashikul Bari Chowdhury is a backend API developer based in Dhaka, Bangladesh. He works primarily with ASP.NET Core, Entity Framework Core and PostgreSQL, and builds full-stack web applications with React and TypeScript. He holds a B.Sc. in Computer Science and Engineering from North South University, Dhaka, and serves as Chief Operating Officer at Reevolt. He is building deliberately toward a career in cybersecurity governance, risk and compliance.',
  profileImageUrl: '/img/profile_image.webp',
  locality: 'Dhaka',
  region: 'Dhaka',
  countryName: 'Bangladesh',
  countryCode: 'BD',
  geo: { lat: 23.8103, lng: 90.4125 },
  nationality: 'Bangladesh',
  languages: ['en', 'bn'],
  jobTitles: ['Backend Developer', 'ASP.NET API Developer', 'Chief Operating Officer'],
  knowsAbout: [
    'ASP.NET Core',
    'C#',
    'Entity Framework Core',
    'REST API development',
    'PostgreSQL',
    'SQL',
    'React',
    'TypeScript',
    'Web application security',
    'Governance, Risk and Compliance (GRC)',
    'Git',
    'Agile project management',
  ],
  currentEmployer: {
    name: 'Reevolt',
    url: 'https://reevolt.io',
    role: 'Chief Operating Officer',
    startDate: '2025',
    summary:
      'Directs strategic operations, manages project deliverables and leads cross-functional teams, aligning engineering effort with business scaling goals.',
  },
  education: [
    {
      degree: 'B.Sc. in Computer Science & Engineering',
      institution: 'North South University',
      institutionUrl: 'https://www.northsouth.edu',
      locality: 'Dhaka',
      countryCode: 'BD',
      startYear: 2020,
      endYear: 2025,
      note: 'Built a foundation in software engineering, algorithms and advanced database systems.',
    },
  ],
  certifications: [
    {
      name: 'Google Cybersecurity Fundamentals Certificate',
      issuer: 'Google',
      issuerUrl: 'https://grow.google',
    },
    { name: 'Be a Project Manager Bootcamp Certificate', issuer: 'Tiny R&D' },
  ],
  email: 'ashikul.chowdhury@proton.me',
  telephone: null,
  sameAs: ['https://github.com/ashikulbarichy', 'https://www.linkedin.com/in/ashikulbarichy'],
  openToWork: true,
  seeksRoles: [
    'Backend developer',
    'ASP.NET / .NET API developer',
    'Full-stack developer',
    'GRC analyst (entry level)',
    'Information security analyst (entry level)',
  ],
  seeksLocations: ['Dhaka', 'Bangladesh', 'Remote'],
}

export const defaultSiteSettings: SiteSettings = {
  // null, not a frozen string: even in the fallback path the title and
  // description are derived from defaultIdentity, so the two can never
  // disagree with each other.
  seoTitle: null,
  seoDescription: null,
  seoKeywords: null,
  ogImageUrl: '/img/profile_image.webp',
  twitterHandle: null,
  llmsIntro: null,
  allowAiCrawlers: true,
  googleSiteVerification: null,
  bingSiteVerification: null,
}

export const defaultLandingData: LandingPageData = {
  heroName: 'Ashikul Bari Chowdhury',
  heroRole: 'ASP.NET API Developer, building toward GRC',
  heroSubtitle:
    'A backend developer working with ASP.NET, and building deliberately toward a career in cybersecurity risk and compliance.',
  heroLocation: 'Dhaka, Bangladesh',
  profilePicUrl: '/img/profile_image.webp',
  certifications: ['Google Cybersecurity Fundamentals', 'Tiny R&D Be A Project Manager Bootcamp'],
  skills: [
    'PostgreSQL',
    'React',
    'TypeScript',
    'SQL',
    'Git',
    'Agile/PM',
    'Web App Security',
    'GRC',
    'ASP.NET',
    'EF Core',
  ],
  cvUrl: undefined,
}

export const defaultMenuData: MenuData = {
  brandFirst: 'ashikul',
  brandLast: '.',
  email: 'ashikul.chowdhury@proton.me',
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
  ],
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/ashikulbarichy' },
    { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/ashikulbarichy' },
  ],
}

export const defaultAboutSlides: AboutSlide[] = [
  {
    id: '01',
    tag: 'Education / B.Sc.',
    outlineText: 'EDUCATION',
    title: 'B.Sc. in Computer Science',
    description:
      'Completed my Bachelor of Science in Computer Science & Engineering from North South University, building a strong foundation in software engineering, algorithms and advanced database systems.',
    timelinePoints: ['2020', '2025'],
    order: 1,
  },
]

export const defaultFaqs: Faq[] = [
  {
    question: 'Who is Ashikul Bari Chowdhury?',
    answer:
      'Ashikul Bari Chowdhury is a backend API developer based in Dhaka, Bangladesh. He works primarily with ASP.NET Core, Entity Framework Core and PostgreSQL, and serves as Chief Operating Officer at Reevolt, where he directs operations and leads cross-functional development teams. He holds a B.Sc. in Computer Science and Engineering from North South University in Dhaka and is building deliberately toward a career in cybersecurity governance, risk and compliance.',
    order: 1,
  },
  {
    question: 'What does Ashikul Bari Chowdhury work on?',
    answer:
      'He builds backend APIs and full-stack web applications, working in C# and ASP.NET Core with Entity Framework Core on the server side, and React with TypeScript on the front end. His data work is mostly PostgreSQL and SQL. Alongside development he focuses on web application security and governance, risk and compliance fundamentals, and manages delivery using Agile practices.',
    order: 2,
  },
  {
    question: 'Where is Ashikul Bari Chowdhury based?',
    answer:
      'Ashikul Bari Chowdhury is based in Dhaka, Bangladesh. He is available for roles in Dhaka and across Bangladesh, and is open to remote and hybrid positions internationally.',
    order: 3,
  },
  {
    question: 'What roles is Ashikul Bari Chowdhury open to?',
    answer:
      'He is open to backend developer and ASP.NET developer roles, full-stack engineering roles, and entry-level GRC, compliance or information security analyst positions in Dhaka and across Bangladesh, as well as remote and hybrid work. He can be reached at ashikul.chowdhury@proton.me.',
    order: 4,
  },
]

/**
 * The interface copy the site ships with.
 *
 * These are the exact strings that were hardcoded in the components before
 * they became editable. A blank field in the Sanity `uiText` document falls
 * back to the value here, so an empty document renders the site unchanged.
 */
export const defaultUiText: UiText = {
  hero: {
    certificationsLabel: 'Certifications & Achievements',
    skillsLabel: 'Core Skills',
    viewWorkLabel: 'View My Work',
    downloadCvLabel: 'Download CV',
    openMenuLabel: 'Open Menu',
  },
  nav: {
    closeMenuLabel: 'Close menu',
  },
  about: {
    headingLine1: 'Bytes',
    headingLine2: 'about me',
    scrollHint: 'scroll to explore',
  },
  featured: {
    sectionLabel: '[ Featured Projects ]',
    techStackLabel: 'Tech Stack',
    overviewLabel: 'Overview',
    githubLabel: 'GitHub Code',
    liveSiteLabel: 'Live Site',
    viewAllLabel: 'More Selected Works',
    loadingLabel: 'Loading Projects...',
  },
  projects: {
    sectionLabel: '[ Project Archive ]',
    categoryLabel: 'Category',
    techStackLabel: 'Tech Stack',
    overviewLabel: 'Overview',
    caseStudyLabel: 'Case Study',
    githubLabel: 'GitHub Code',
    liveSiteLabel: 'Live Site',
    emptyMessage: 'No projects match filter.',
    dragHint: 'drag · scroll · click side cards',
    loadingLabel: 'Initialising Archive...',
    statsProjectsLabel: 'projects',
    statsTechsLabel: 'techs',
    allProjectsHeading: 'All projects',
  },
  projectDetail: {
    backLabel: 'All projects',
    highlightsLabel: 'Highlights',
    techStackLabel: 'Tech stack',
    liveSiteLabel: 'Live site',
    sourceLabel: 'Source code',
    roleLabel: 'Role',
    categoryLabel: 'Category',
    durationLabel: 'Duration',
    dateLabel: 'Date',
  },
  faq: {
    headingLine1: 'Common',
    headingLine2: 'questions',
  },
  contact: {
    headingLine1: 'Get in',
    headingLine2: 'touch',
    locationLabel: 'Dhaka, Bangladesh — GMT+6',
    emailLabel: 'Direct Email',
    availabilityLabel: 'Availability',
    availabilityText: 'Open for opportunities (expected response within 24h)',
  },
  loadingScreen: {
    stage1: 'CONFIGURING CORES',
    stage2: 'LOADING PORTFOLIO DATA',
    stage3: 'DECRYPTING MEDIA',
    stage4: 'FINALIZING INTERFACE',
    stageComplete: 'BOOT COMPLETE',
    bypassLabel: '[ BYPASS SEQUENCE ]',
    bypassingLabel: 'BYPASSING',
    grantedLabel: '[ ACCESS GRANTED ]',
  },
  notFound: {
    heading: 'Page not found',
    body:
      'This page does not exist, or it moved. If you followed a link to a project, try the projects index.',
    homeLabel: 'Home',
    projectsLabel: 'All projects',
  },
}
