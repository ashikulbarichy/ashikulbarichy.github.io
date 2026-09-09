import {defineField, defineType} from 'sanity'

/**
 * Site settings — singleton.
 *
 * Site-wide defaults. Anything a page does not override falls back to here,
 * and anything left blank here falls back to values derived from Identity.
 *
 * Your existing four fields (seoTitle, seoDescription, seoKeywords, ogImage)
 * are kept under the same names, so the document you already have keeps
 * working untouched.
 */
export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'seo', title: 'Search & social', default: true },
    { name: 'ai', title: 'AI assistants' },
    { name: 'verify', title: 'Verification' },
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'Default page title',
      type: 'string',
      group: 'seo',
      description:
        'LEAVE BLANK to derive it automatically from Identity, as "<name> | <first job title>, <city>". Blank is the recommended setting: it means the title updates by itself whenever you edit Identity, so it can never drift out of step with the rest of the site. Fill this in only to override, and keep it under about 60 characters so Google does not truncate it.',
      validation: (Rule) =>
        Rule.max(70).warning('Titles over about 60 characters get cut off in search results.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Default meta description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'LEAVE BLANK to derive it from your Identity biography, trimmed to whole sentences at about 155 characters. Blank is recommended for the same reason as the title: edit your bio once and this follows. Fill in to override, writing a sentence a person would actually read rather than a keyword list.',
      validation: (Rule) =>
        Rule.max(180).warning('Descriptions over about 160 characters get truncated.'),
    }),
    defineField({
      name: 'seoKeywords',
      title: 'Keywords',
      type: 'text',
      rows: 2,
      group: 'seo',
      description:
        'Honest note: Google has ignored the keywords meta tag since 2009, and so does Bing, so this affects nothing about ranking. Leave blank and it is derived from your Identity job titles and expertise. The field exists only because you may want it for your own reference.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Default social share image',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      description:
        'Used when your pages are shared on LinkedIn, X, Slack or WhatsApp. Ideal size 1200x630. A portrait crop gets letterboxed, so a landscape image with your name on it performs better.',
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'twitterHandle',
      title: 'X / Twitter handle',
      type: 'string',
      group: 'seo',
      description:
        'With the @, e.g. "@ashikulbarichy". Leave blank if you do not have an active account. Do not point at an account that does not exist.',
    }),

    // ── AI assistants ─────────────────────────────────────────
    defineField({
      name: 'llmsIntro',
      title: 'llms.txt summary line',
      type: 'text',
      rows: 3,
      group: 'ai',
      description:
        'The one-line summary at the top of /llms.txt, the file AI assistants read. This is your elevator pitch to a language model: one or two sentences, plain prose, no keyword stuffing. Leave blank to derive it from your Identity headline and bio.',
    }),
    defineField({
      name: 'allowAiCrawlers',
      title: 'Allow AI crawlers',
      type: 'boolean',
      group: 'ai',
      initialValue: true,
      description:
        'On: robots.txt invites GPTBot, ClaudeBot, PerplexityBot, Google-Extended and friends, so you can be cited in AI answers. Off: robots.txt asks them to stay out. Leave this on if you want to be found by people using AI assistants to search.',
    }),

    // ── Verification ──────────────────────────────────────────
    defineField({
      name: 'googleSiteVerification',
      title: 'Google Search Console verification token',
      type: 'string',
      group: 'verify',
      description:
        'Just the token from the HTML-tag method, not the whole tag. Only needed if you verify by meta tag rather than by DNS.',
    }),
    defineField({
      name: 'bingSiteVerification',
      title: 'Bing Webmaster verification token',
      type: 'string',
      group: 'verify',
      description:
        'Worth doing: Bing feeds ChatGPT search, so being indexed there affects whether AI assistants can find you.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
})
