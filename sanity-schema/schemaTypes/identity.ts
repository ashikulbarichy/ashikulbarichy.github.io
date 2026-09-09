import {defineField, defineType} from 'sanity'

/**
 * Identity — the single source of truth for who you are.
 *
 * This is a SINGLETON: there should only ever be one of these documents.
 * Everything in it feeds the machine-readable layer of the site:
 *
 *   - Person JSON-LD (what Google's Knowledge Graph reads)
 *   - /llms.txt (what ChatGPT, Claude and Perplexity read)
 *   - humans.txt
 *   - Fallback meta description
 *
 * The rule that matters: these facts must not contradict what a visitor can
 * read on the page. Search engines compare the two, and language models hedge
 * or omit you entirely when sources disagree. If you change your job title
 * here, change it in the Hero too.
 */
export const identityType = defineType({
  name: 'identity',
  title: 'Identity (SEO source of truth)',
  type: 'document',
  groups: [
    { name: 'basics', title: 'Basics', default: true },
    { name: 'location', title: 'Location' },
    { name: 'professional', title: 'Professional' },
    { name: 'history', title: 'Education & certs' },
    { name: 'links', title: 'Links' },
    { name: 'availability', title: 'Availability' },
  ],
  fields: [
    // ── Basics ────────────────────────────────────────────────
    defineField({
      name: 'fullName',
      title: 'Full name',
      type: 'string',
      group: 'basics',
      description: 'Exactly as you want it to appear in search results and AI answers.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'givenName',
      title: 'Given name',
      type: 'string',
      group: 'basics',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'familyName',
      title: 'Family name',
      type: 'string',
      group: 'basics',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alternateNames',
      title: 'Also known as',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'basics',
      description:
        'Shorter forms or spellings people might search for, e.g. "Ashikul Bari". Helps search engines connect variations to one person.',
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'basics',
      description:
        'One short line, the way you would introduce yourself. This must match your Hero role. Example: "ASP.NET API Developer, building toward GRC".',
      validation: (Rule) => Rule.required().max(90),
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 6,
      group: 'basics',
      description:
        'Two to four sentences in third person, written as prose. This is the single most important field on this page: it is what an AI assistant quotes when someone asks who you are. State what you do, where you are, and what you are working toward. No keyword lists.',
      validation: (Rule) =>
        Rule.required()
          .min(120)
          .warning(
            'A short bio gives AI assistants very little to work with. Aim for 2-4 full sentences.'
          ),
    }),
    defineField({
      name: 'profileImage',
      title: 'Profile image',
      type: 'image',
      group: 'basics',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),

    // ── Location ──────────────────────────────────────────────
    defineField({
      name: 'locality',
      title: 'City',
      type: 'string',
      group: 'location',
      description: 'e.g. Dhaka',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'region',
      title: 'Region / division / state',
      type: 'string',
      group: 'location',
      description: 'e.g. Dhaka',
    }),
    defineField({
      name: 'countryName',
      title: 'Country',
      type: 'string',
      group: 'location',
      description: 'e.g. Bangladesh',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'countryCode',
      title: 'Country code (ISO 3166-1 alpha-2)',
      type: 'string',
      group: 'location',
      description:
        'Two letters, e.g. BD for Bangladesh, AU for Australia. This must match the country above. A mismatch here is what made the old site claim Dhaka, Australia.',
      validation: (Rule) =>
        Rule.required().length(2).uppercase().error('Use exactly two uppercase letters, e.g. BD.'),
    }),
    defineField({
      name: 'geo',
      title: 'Coordinates',
      type: 'geopoint',
      group: 'location',
      description: 'Drop a pin on your city. Used for the geo meta tags.',
    }),
    defineField({
      name: 'nationality',
      title: 'Nationality',
      type: 'string',
      group: 'location',
      description: 'e.g. Bangladesh',
    }),
    defineField({
      name: 'languages',
      title: 'Languages spoken',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'location',
      description: 'BCP 47 codes, e.g. "en", "bn".',
    }),

    // ── Professional ──────────────────────────────────────────
    defineField({
      name: 'jobTitles',
      title: 'Job titles',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'professional',
      description:
        'Titles you actually hold, most important first. Do not add aspirational titles: claiming a role you do not hold is the fastest way to lose trust with both Google and AI assistants.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'knowsAbout',
      title: 'Areas of expertise',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'professional',
      description:
        'Technologies and disciplines you can genuinely speak to in an interview. Keep this to 10-15 entries. A list of 30 reads as keyword stuffing and gets discounted.',
      validation: (Rule) =>
        Rule.max(20).warning(
          'Long expertise lists get treated as keyword stuffing. Trim to the ones you would defend in an interview.'
        ),
    }),
    defineField({
      name: 'currentEmployer',
      title: 'Current employer',
      type: 'object',
      group: 'professional',
      description: 'Leave the name blank if you are not currently employed.',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'name', title: 'Organisation name', type: 'string' }),
        defineField({ name: 'url', title: 'Organisation website', type: 'url' }),
        defineField({ name: 'role', title: 'Your role there', type: 'string' }),
        defineField({
          name: 'startDate',
          title: 'Started',
          type: 'string',
          description: 'Year or YYYY-MM, e.g. "2025".',
        }),
        defineField({
          name: 'summary',
          title: 'What you do there',
          type: 'text',
          rows: 3,
          description: 'One or two sentences. Used in llms.txt.',
        }),
      ],
    }),

    // ── Education & certifications ────────────────────────────
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      group: 'history',
      of: [
        {
          type: 'object',
          name: 'educationEntry',
          fields: [
            defineField({
              name: 'degree',
              title: 'Degree',
              type: 'string',
              description: 'e.g. "B.Sc. in Computer Science & Engineering"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'institution',
              title: 'Institution',
              type: 'string',
              description:
                'The real name of the school, e.g. "North South University". Not a city name.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'institutionUrl', title: 'Institution website', type: 'url' }),
            defineField({ name: 'locality', title: 'City', type: 'string' }),
            defineField({
              name: 'countryCode',
              title: 'Country code',
              type: 'string',
              validation: (Rule) => Rule.length(2).uppercase(),
            }),
            defineField({ name: 'startYear', title: 'Start year', type: 'number' }),
            defineField({ name: 'endYear', title: 'End year', type: 'number' }),
            defineField({
              name: 'note',
              title: 'Note',
              type: 'text',
              rows: 2,
              description: 'Optional: what you focused on.',
            }),
          ],
          preview: { select: { title: 'degree', subtitle: 'institution' } },
        },
      ],
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      group: 'history',
      of: [
        {
          type: 'object',
          name: 'certificationEntry',
          fields: [
            defineField({
              name: 'name',
              title: 'Certificate name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'issuer',
              title: 'Issued by',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'issuerUrl', title: 'Issuer website', type: 'url' }),
            defineField({ name: 'year', title: 'Year', type: 'number' }),
            defineField({
              name: 'credentialUrl',
              title: 'Verification link',
              type: 'url',
              description:
                'A public link that proves you hold this. Verifiable credentials carry far more weight than unverifiable claims.',
            }),
          ],
          preview: { select: { title: 'name', subtitle: 'issuer' } },
        },
      ],
    }),

    // ── Links ─────────────────────────────────────────────────
    defineField({
      name: 'email',
      title: 'Contact email',
      type: 'string',
      group: 'links',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'telephone',
      title: 'Phone number',
      type: 'string',
      group: 'links',
      description:
        'Optional, and deliberately blank by default. A phone number in structured data is machine-readable by scrapers as well as by search engines, so only fill this in if you want it publicly harvestable.',
    }),
    defineField({
      name: 'sameAs',
      title: 'Profiles elsewhere',
      type: 'array',
      of: [{ type: 'url' }],
      group: 'links',
      description:
        'Full URLs to profiles that are unmistakably you: LinkedIn, GitHub, X, Stack Overflow, ORCID, a conference speaker page. This is how a search engine or AI assistant confirms that scattered mentions are all one person. Only list profiles that exist and are current, because a dead link here actively hurts.',
    }),

    // ── Availability ──────────────────────────────────────────
    defineField({
      name: 'openToWork',
      title: 'Open to work',
      type: 'boolean',
      group: 'availability',
      initialValue: true,
      description: 'Turn off to drop the availability section from schema and llms.txt.',
    }),
    defineField({
      name: 'seeksRoles',
      title: 'Roles sought',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'availability',
      description: 'e.g. "Backend developer", "ASP.NET developer", "GRC analyst".',
      hidden: ({ document }) => !document?.openToWork,
    }),
    defineField({
      name: 'seeksLocations',
      title: 'Locations considered',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'availability',
      description: 'e.g. "Dhaka", "Bangladesh", "Remote".',
      hidden: ({ document }) => !document?.openToWork,
    }),
  ],
  preview: {
    select: { title: 'fullName', subtitle: 'headline', media: 'profileImage' },
  },
})
