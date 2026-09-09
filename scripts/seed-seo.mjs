#!/usr/bin/env node
/**
 * Seed + migrate the SEO layer in Sanity.
 *
 * What it does, all idempotent:
 *
 *   1. Creates the `identity` singleton if it does not exist.
 *   2. Creates the FAQ documents if they do not exist.
 *   3. Backfills `slug` on every project that lacks one (derived from title).
 *   4. Backfills `summary` on every project that lacks one (from `description`).
 *   5. Backfills `publishedAt` on every project that lacks one (from _createdAt).
 *
 * Running it twice is safe: existing documents are left alone unless you pass
 * --force, and slugs are never regenerated once set (changing a live slug
 * breaks its indexed URL).
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=xxx node scripts/seed-seo.mjs --dry-run
 *   SANITY_WRITE_TOKEN=xxx node scripts/seed-seo.mjs
 *
 * The token needs Editor permissions. Create a fresh one at
 * sanity.io/manage -> your project -> API -> Tokens. Do NOT reuse the token
 * that was previously in VITE_SANITY_API_TOKEN: that one was compiled into
 * the public JS bundle and should be revoked.
 */

import { createClient } from '@sanity/client'

const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'eu7fw3iy'
const DATASET = process.env.SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_WRITE_TOKEN
const DRY = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')

if (!TOKEN && !DRY) {
  console.error(
    'SANITY_WRITE_TOKEN is not set.\n' +
      'Create an Editor token at sanity.io/manage, then run:\n' +
      '  SANITY_WRITE_TOKEN=xxx node scripts/seed-seo.mjs --dry-run'
  )
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2023-05-03',
  token: TOKEN,
  useCdn: false,
})

const slugify = (input) =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

// ─────────────────────────────────────────────────────────────
// The canonical identity facts.
//
// These were reconciled against the live Sanity data in September 2026.
// Positioning is deliberately "backend developer moving into GRC" rather than
// "cyber security analyst", because that is what the hero copy says and
// contradictory claims cost you trust with both Google and AI assistants.
// ─────────────────────────────────────────────────────────────
const IDENTITY = {
  _id: 'identity',
  _type: 'identity',
  fullName: 'Ashikul Bari Chowdhury',
  givenName: 'Ashikul',
  familyName: 'Bari Chowdhury',
  alternateNames: ['Ashikul Bari'],
  headline: 'ASP.NET API Developer, building toward GRC',
  bio:
    'Ashikul Bari Chowdhury is a backend API developer based in Dhaka, Bangladesh. He works primarily with ASP.NET Core, Entity Framework Core and PostgreSQL, and builds full-stack web applications with React and TypeScript. He holds a B.Sc. in Computer Science and Engineering from North South University, Dhaka, and serves as Chief Operating Officer at Reevolt. He is building deliberately toward a career in cybersecurity governance, risk and compliance.',
  locality: 'Dhaka',
  region: 'Dhaka',
  countryName: 'Bangladesh',
  countryCode: 'BD',
  geo: { _type: 'geopoint', lat: 23.8103, lng: 90.4125 },
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
      _key: 'nsu-bsc',
      _type: 'educationEntry',
      degree: 'B.Sc. in Computer Science & Engineering',
      institution: 'North South University',
      institutionUrl: 'https://www.northsouth.edu',
      locality: 'Dhaka',
      countryCode: 'BD',
      startYear: 2020,
      endYear: 2025,
      note:
        'Built a foundation in software engineering, algorithms and advanced database systems.',
    },
  ],
  certifications: [
    {
      _key: 'google-cyber',
      _type: 'certificationEntry',
      name: 'Google Cybersecurity Fundamentals Certificate',
      issuer: 'Google',
      issuerUrl: 'https://grow.google',
    },
    {
      _key: 'tiny-rd-pm',
      _type: 'certificationEntry',
      name: 'Be a Project Manager Bootcamp Certificate',
      issuer: 'Tiny R&D',
    },
  ],
  email: 'ashikul.chowdhury@proton.me',
  // telephone deliberately omitted: it was previously published in structured
  // data, which makes it harvestable. Add it back only if you want that.
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

// Site settings: only the AI-crawler toggle is set to a value.
//
// seoTitle / seoDescription / seoKeywords are deliberately CLEARED rather than
// filled in. Blank means "derive from Identity", so the homepage title and
// description recompute from the identity document every time it is edited.
// That is what keeps metadata from drifting away from the visible copy — the
// failure that had this site claiming a job title its own hero contradicted.
// Type a value into either field in the Studio at any time to override.
const SITE_SETTINGS_SET = {
  allowAiCrawlers: true,
}

const SITE_SETTINGS_UNSET = ['seoTitle', 'seoDescription', 'seoKeywords']

// UI text: created empty on purpose.
//
// Every field in the schema carries an initialValue matching what the site
// currently renders, so the Studio shows the real wording ready to edit, and
// any field left blank falls back to the built-in default in code. Creating an
// empty document is enough to make the singleton appear in the Studio.
const UI_TEXT = { _id: 'uiText', _type: 'uiText' }

const FAQS = [
  {
    _id: 'faq.who',
    question: 'Who is Ashikul Bari Chowdhury?',
    answer:
      'Ashikul Bari Chowdhury is a backend API developer based in Dhaka, Bangladesh. He works primarily with ASP.NET Core, Entity Framework Core and PostgreSQL, and serves as Chief Operating Officer at Reevolt, where he directs operations and leads cross-functional development teams. He holds a B.Sc. in Computer Science and Engineering from North South University in Dhaka and is building deliberately toward a career in cybersecurity governance, risk and compliance.',
    order: 1,
  },
  {
    _id: 'faq.work',
    question: 'What does Ashikul Bari Chowdhury work on?',
    answer:
      'He builds backend APIs and full-stack web applications, working in C# and ASP.NET Core with Entity Framework Core on the server side, and React with TypeScript on the front end. His data work is mostly PostgreSQL and SQL. Alongside development he focuses on web application security and governance, risk and compliance fundamentals, and manages delivery using Agile practices.',
    order: 2,
  },
  {
    _id: 'faq.location',
    question: 'Where is Ashikul Bari Chowdhury based?',
    answer:
      'Ashikul Bari Chowdhury is based in Dhaka, Bangladesh. He is available for roles in Dhaka and across Bangladesh, and is open to remote and hybrid positions internationally.',
    order: 3,
  },
  {
    _id: 'faq.roles',
    question: 'What roles is Ashikul Bari Chowdhury open to?',
    answer:
      'He is open to backend developer and ASP.NET developer roles, full-stack engineering roles, and entry-level GRC, compliance or information security analyst positions in Dhaka and across Bangladesh, as well as remote and hybrid work. He can be reached at ashikul.chowdhury@proton.me.',
    order: 4,
  },
  {
    _id: 'faq.qualifications',
    question: 'What are Ashikul Bari Chowdhury’s qualifications?',
    answer:
      'He holds a B.Sc. in Computer Science and Engineering from North South University, Dhaka (2020-2025), covering software engineering, algorithms and advanced database systems. He also holds the Google Cybersecurity Fundamentals certificate and completed the Tiny R&D Be a Project Manager bootcamp.',
    order: 5,
  },
  {
    _id: 'faq.stack',
    question: 'What technologies does Ashikul Bari Chowdhury use?',
    answer:
      'His main stack is ASP.NET Core and C# with Entity Framework Core for backend APIs, React and TypeScript on the front end, and PostgreSQL or SQLite for data. He also works with Tailwind CSS, Supabase and Git, and applies Agile project management practices.',
    order: 6,
  },
]

async function main() {
  console.log(`\nProject ${PROJECT_ID} / dataset ${DATASET}${DRY ? '  (DRY RUN)' : ''}\n`)

  const tx = client.transaction()
  let planned = 0
  const plan = (line) => {
    planned++
    console.log('  ' + line)
  }

  // ── 1. Identity singleton ──────────────────────────────────
  const existingIdentity = await client.fetch('*[_type == "identity"][0]{_id}')
  console.log('Identity')
  if (existingIdentity && !FORCE) {
    console.log('  already exists, leaving alone (pass --force to overwrite)')
  } else if (existingIdentity && FORCE) {
    plan(`overwrite identity ${existingIdentity._id}`)
    tx.createOrReplace({ ...IDENTITY, _id: existingIdentity._id })
  } else {
    plan('create identity singleton')
    tx.createIfNotExists(IDENTITY)
  }

  // ── 1b. Site settings copy ─────────────────────────────────
  // The existing siteSettings document still holds the security-first
  // positioning ("Cyber Security Analyst & GRC Specialist"), which contradicts
  // the hero copy. Bring the title and description in line; leave any other
  // fields the user has set alone.
  console.log('\nSite settings')
  const existingSettings = await client.fetch(
    '*[_type == "siteSettings"][0]{_id, seoTitle, seoDescription}'
  )
  if (!existingSettings) {
    plan('create siteSettings (title/description left blank so they derive from Identity)')
    tx.createIfNotExists({ _id: 'siteSettings', _type: 'siteSettings', ...SITE_SETTINGS_SET })
  } else {
    const hasHardcoded = Boolean(
      (existingSettings.seoTitle || '').trim() || (existingSettings.seoDescription || '').trim()
    )
    if (hasHardcoded || FORCE) {
      plan(
        'clear siteSettings seoTitle/seoDescription/seoKeywords so they derive from Identity'
      )
      tx.patch(existingSettings._id, {
        set: SITE_SETTINGS_SET,
        unset: SITE_SETTINGS_UNSET,
      })
    } else {
      console.log('  already deriving from Identity, leaving alone')
    }
  }

  // ── 1c. UI text singleton ──────────────────────────────────
  console.log('\nUI text')
  const existingUiText = await client.fetch('*[_type == "uiText"][0]{_id}')
  if (existingUiText) {
    console.log('  already exists, leaving alone')
  } else {
    plan('create uiText singleton (all labels editable in the Studio)')
    tx.createIfNotExists(UI_TEXT)
  }

  // ── 2. FAQ documents ───────────────────────────────────────
  console.log('\nFAQ')
  const existingFaqIds = await client.fetch('*[_type == "faq"]._id')
  for (const faq of FAQS) {
    const doc = { ...faq, _type: 'faq', hidden: false }
    if (existingFaqIds.includes(faq._id) && !FORCE) {
      console.log(`  ${faq._id} already exists, skipping`)
    } else if (existingFaqIds.includes(faq._id)) {
      plan(`overwrite ${faq._id}`)
      tx.createOrReplace(doc)
    } else {
      plan(`create ${faq._id} — ${faq.question}`)
      tx.createIfNotExists(doc)
    }
  }

  // ── 3-5. Project backfills ─────────────────────────────────
  console.log('\nProjects')
  const projects = await client.fetch(
    '*[_type == "project"]{_id, _createdAt, title, description, summary, slug, publishedAt}'
  )
  const takenSlugs = new Set(projects.map((p) => p?.slug?.current).filter(Boolean))

  for (const p of projects) {
    const patch = {}

    if (!p.slug?.current) {
      let base = slugify(p.title || 'project')
      let candidate = base
      let n = 2
      while (takenSlugs.has(candidate)) candidate = `${base}-${n++}`
      takenSlugs.add(candidate)
      patch.slug = { _type: 'slug', current: candidate }
    }

    if (!p.summary && p.description) {
      // First two sentences of the legacy description, trimmed to meta length.
      const sentences = p.description.match(/[^.!?]+[.!?]+/g) || [p.description]
      let summary = sentences.slice(0, 2).join(' ').trim()
      if (summary.length > 280) summary = summary.slice(0, 277).trimEnd() + '...'
      patch.summary = summary
    }

    if (!p.publishedAt) {
      patch.publishedAt = p._createdAt
    }

    if (Object.keys(patch).length === 0) {
      console.log(`  ${p.title} — nothing to do`)
      continue
    }

    plan(
      `patch ${p.title}: ${Object.entries(patch)
        .map(([k, v]) => `${k}=${JSON.stringify(v).slice(0, 60)}`)
        .join(', ')}`
    )
    tx.patch(p._id, { set: patch })
  }

  // ── Commit ─────────────────────────────────────────────────
  console.log('')
  if (planned === 0) {
    console.log('Nothing to do. Everything is already in place.')
    return
  }
  if (DRY) {
    console.log(`DRY RUN: ${planned} change(s) planned, nothing written.`)
    console.log('Re-run without --dry-run to apply.')
    return
  }
  await tx.commit()
  console.log(`Committed ${planned} change(s).`)
}

main().catch((err) => {
  console.error('\nFailed:', err.message)
  if (err.statusCode === 401 || err.statusCode === 403) {
    console.error('That looks like a token problem. The token needs Editor permissions.')
  }
  process.exit(1)
})
