import {defineField, defineType} from 'sanity'

/**
 * Project.
 *
 * This replaces your existing `project` type. Every field you already have is
 * kept with the same name, so existing documents keep working. What is new:
 *
 *   - `slug`          gives each project its own indexable URL at /projects/<slug>
 *   - `summary`       one-sentence prose, used in cards, meta descriptions and llms.txt
 *   - `body`          the long write-up that makes a project page worth ranking
 *   - `role`          what you actually did, which is what an interviewer asks
 *   - `highlights`    concrete outcomes
 *   - `publishedAt`   drives sitemap lastmod
 *   - `seo`           per-project overrides
 *
 * Why per-project pages matter: right now the whole site is effectively one
 * URL. Fifteen projects with their own pages are fifteen chances to rank for a
 * specific technology or problem, instead of one page trying to rank for all
 * of them at once.
 */
export const projectType = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Details' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      description:
        'The URL for this project, e.g. "aussie-solar-nation-landing-page" becomes /projects/aussie-solar-nation-landing-page. Click Generate. Once a project is live and indexed, changing this breaks the old URL, so avoid editing it afterwards.',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .normalize('NFKD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 2,
      group: 'content',
      description:
        'One or two sentences describing what this is and who it is for. Used on cards, as the fallback meta description, and in llms.txt. Write it as prose, not a tag list.',
      validation: (Rule) =>
        Rule.required()
          .max(280)
          .warning('Keep the summary under about 200 characters so it works as a meta description.'),
    }),
    defineField({
      name: 'description',
      title: 'Description (legacy)',
      type: 'text',
      rows: 4,
      group: 'content',
      description:
        'Your original description field, kept so existing documents are not broken. New work should go in Summary and Body. This is used as a fallback when Summary is empty.',
    }),
    defineField({
      name: 'body',
      title: 'Write-up',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) => Rule.required(),
                  }),
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description:
                'Describe what the image shows. Read by screen readers and by image search.',
            }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
      description:
        'The full write-up: the problem, what you built, the decisions you made and what happened. This is the content that makes a project page rank on its own and gives an AI assistant something specific to cite. A few hundred words of real detail beats a paragraph of adjectives.',
    }),
    defineField({
      name: 'image',
      title: 'Cover image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the screenshot, e.g. "Admin dashboard showing lead pipeline".',
        }),
      ],
    }),

    // ── Details ───────────────────────────────────────────────
    defineField({
      name: 'role',
      title: 'Your role',
      type: 'string',
      group: 'meta',
      description: 'e.g. "Backend developer", "Solo build", "Tech lead, team of 4".',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'meta',
      description:
        'Concrete outcomes, one per line. Numbers are what get quoted, e.g. "Cut lead response time from 2 days to 4 hours".',
    }),
    defineField({
      name: 'tags',
      title: 'Tech stack',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'meta',
      description:
        'Spell these correctly and consistently: they are how people find the project. "TypeScript", not "Typscript".',
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'Enterprise', value: 'Enterprise' },
          { title: 'EdTech', value: 'EdTech' },
          { title: 'Healthcare', value: 'Healthcare' },
          { title: 'Fintech', value: 'Fintech' },
          { title: 'Security', value: 'Security' },
          { title: 'Open source', value: 'Open source' },
          { title: 'Personal', value: 'Personal' },
        ],
      },
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'Application', value: 'application' },
          { title: 'Website', value: 'website' },
          { title: 'API / service', value: 'api' },
          { title: 'Tool / library', value: 'tool' },
        ],
      },
      initialValue: 'application',
    }),
    defineField({
      name: 'projectUrl',
      title: 'Live URL',
      type: 'url',
      group: 'meta',
    }),
    defineField({
      name: 'repoUrl',
      title: 'Source code URL',
      type: 'url',
      group: 'meta',
      description:
        'A public repo is strong corroborating evidence. Search engines and assistants weight claims you can verify.',
    }),
    defineField({
      name: 'isLive',
      title: 'Is live',
      type: 'boolean',
      group: 'meta',
      initialValue: false,
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      group: 'meta',
      description: 'e.g. "4 months".',
    }),
    defineField({
      name: 'date',
      title: 'Date label (legacy)',
      type: 'string',
      group: 'meta',
      description:
        'Your original free-text date, e.g. "June 2026". Kept for display. Use Published at below for anything machine-readable.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'meta',
      description:
        'A real date. This drives the sitemap lastmod value and the datePublished in structured data, which is how a crawler knows the page is fresh.',
    }),

    // ── SEO ───────────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO overrides',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'image' },
  },
})
