import {defineField, defineType} from 'sanity'

/**
 * Reusable SEO block.
 *
 * Every field is optional on purpose: the site falls back to sensible derived
 * values (document title, first paragraph of the body, the site-wide OG image)
 * when a field is left blank. Only fill these in when you want to override.
 */
export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description:
        'Overrides the browser tab + Google result title. Aim for 50-60 characters. Leave blank to derive from the document title.',
      validation: (Rule) =>
        Rule.max(70).warning('Titles longer than ~60 characters get truncated in Google results.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description:
        'The grey snippet under your Google result. Aim for 140-160 characters. Write it as a sentence a person would read, not a keyword list.',
      validation: (Rule) =>
        Rule.max(180).warning('Descriptions longer than ~160 characters get truncated.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description:
        'Shown when the page is shared on LinkedIn, X, Slack, WhatsApp. Ideal size 1200x630. Falls back to the site-wide image.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description:
        'Turn on to keep this page out of Google and out of the sitemap. Use for drafts and work-in-progress pages.',
      initialValue: false,
    }),
  ],
})
