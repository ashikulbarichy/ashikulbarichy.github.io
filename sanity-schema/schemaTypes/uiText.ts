import {defineField, defineType} from 'sanity'

/**
 * UI Text — singleton.
 *
 * Every fixed label on the site: section headings, button text, column
 * captions, empty states, the loading sequence. Change wording here and it
 * changes on the site without touching code.
 *
 * Leave any field blank and the site uses its built-in default, so an empty
 * document renders exactly what the site renders today. Groups merge field by
 * field, meaning you can fill in one label in a group without wiping the rest.
 *
 * This changes WORDING only. Layout, sizing, colour and spacing are not
 * editable here by design — those live in the code where they can be reviewed.
 */

const label = (name: string, title: string, initialValue: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'string',
    initialValue,
    description,
  })

export const uiTextType = defineType({
  name: 'uiText',
  title: 'UI Text (labels & headings)',
  type: 'document',
  groups: [
    {name: 'home', title: 'Homepage', default: true},
    {name: 'projects', title: 'Projects'},
    {name: 'chrome', title: 'Menu & loading'},
    {name: 'errors', title: '404 page'},
  ],
  fields: [
    // ── Hero ───────────────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'Hero section',
      type: 'object',
      group: 'home',
      options: {collapsible: true, collapsed: false},
      fields: [
        label('certificationsLabel', 'Certifications accordion', 'Certifications & Achievements'),
        label('skillsLabel', 'Skills accordion', 'Core Skills'),
        label('viewWorkLabel', 'View work button', 'View My Work'),
        label('downloadCvLabel', 'Download CV button', 'Download CV'),
        label('openMenuLabel', 'Open menu tooltip', 'Open Menu'),
      ],
    }),

    // ── About ──────────────────────────────────────────────────
    defineField({
      name: 'about',
      title: 'About section',
      type: 'object',
      group: 'home',
      options: {collapsible: true, collapsed: true},
      fields: [
        label(
          'headingLine1',
          'Heading, first line',
          'Bytes',
          'The heading is split across two lines. This is the top line.',
        ),
        label('headingLine2', 'Heading, second line', 'about me'),
        label('scrollHint', 'Scroll hint', 'scroll to explore'),
      ],
    }),

    // ── Featured projects ──────────────────────────────────────
    defineField({
      name: 'featured',
      title: 'Featured projects section',
      type: 'object',
      group: 'home',
      options: {collapsible: true, collapsed: true},
      fields: [
        label('sectionLabel', 'Section label', '[ Featured Projects ]'),
        label('techStackLabel', 'Tech stack caption', 'Tech Stack'),
        label('overviewLabel', 'Overview caption', 'Overview'),
        label('githubLabel', 'GitHub link', 'GitHub Code'),
        label('liveSiteLabel', 'Live site link', 'Live Site'),
        label('viewAllLabel', 'View all button', 'More Selected Works'),
        label('loadingLabel', 'Loading state', 'Loading Projects...'),
      ],
    }),

    // ── FAQ ────────────────────────────────────────────────────
    defineField({
      name: 'faq',
      title: 'FAQ section',
      type: 'object',
      group: 'home',
      options: {collapsible: true, collapsed: true},
      fields: [
        label('headingLine1', 'Heading, first line', 'Common'),
        label('headingLine2', 'Heading, second line', 'questions'),
      ],
    }),

    // ── Contact ────────────────────────────────────────────────
    defineField({
      name: 'contact',
      title: 'Contact section',
      type: 'object',
      group: 'home',
      options: {collapsible: true, collapsed: true},
      fields: [
        label('headingLine1', 'Heading, first line', 'Get in'),
        label('headingLine2', 'Heading, second line', 'touch'),
        label(
          'locationLabel',
          'Location line',
          'Dhaka, Bangladesh — GMT+6',
          'Shown under the heading. Leave blank to use the Hero location verbatim.',
        ),
        label('emailLabel', 'Email caption', 'Direct Email'),
        label('availabilityLabel', 'Availability caption', 'Availability'),
        label(
          'availabilityText',
          'Availability text',
          'Open for opportunities (expected response within 24h)',
        ),
      ],
    }),

    // ── Projects page ──────────────────────────────────────────
    defineField({
      name: 'projects',
      title: 'Projects page',
      type: 'object',
      group: 'projects',
      options: {collapsible: true, collapsed: false},
      fields: [
        label('sectionLabel', 'Section label', '[ Project Archive ]'),
        label('categoryLabel', 'Category caption', 'Category'),
        label('techStackLabel', 'Tech stack caption', 'Tech Stack'),
        label('overviewLabel', 'Overview caption', 'Overview'),
        label('caseStudyLabel', 'Case study link', 'Case Study'),
        label('githubLabel', 'GitHub link', 'GitHub Code'),
        label('liveSiteLabel', 'Live site link', 'Live Site'),
        label('emptyMessage', 'No results message', 'No projects match filter.'),
        label('dragHint', 'Interaction hint', 'drag · scroll · click side cards'),
        label('loadingLabel', 'Loading state', 'Initialising Archive...'),
        label(
          'statsProjectsLabel',
          'Projects counter word',
          'projects',
          'Rendered as "[ 12 projects ]". This is the word after the number.',
        ),
        label('statsTechsLabel', 'Technologies counter word', 'techs'),
        label('allProjectsHeading', 'All-projects list heading', 'All projects'),
      ],
    }),

    // ── Project detail page ────────────────────────────────────
    defineField({
      name: 'projectDetail',
      title: 'Individual project page',
      type: 'object',
      group: 'projects',
      options: {collapsible: true, collapsed: true},
      fields: [
        label('backLabel', 'Back link', 'All projects'),
        label('highlightsLabel', 'Highlights heading', 'Highlights'),
        label('techStackLabel', 'Tech stack heading', 'Tech stack'),
        label('liveSiteLabel', 'Live site link', 'Live site'),
        label('sourceLabel', 'Source code link', 'Source code'),
        label('roleLabel', 'Role caption', 'Role'),
        label('categoryLabel', 'Category caption', 'Category'),
        label('durationLabel', 'Duration caption', 'Duration'),
        label('dateLabel', 'Date caption', 'Date'),
      ],
    }),

    // ── Menu & loading ─────────────────────────────────────────
    defineField({
      name: 'nav',
      title: 'Navigation menu',
      type: 'object',
      group: 'chrome',
      options: {collapsible: true, collapsed: false},
      fields: [
        label(
          'closeMenuLabel',
          'Close button label',
          'Close menu',
          'Read aloud by screen readers. Not visible on screen.',
        ),
      ],
    }),
    defineField({
      name: 'loadingScreen',
      title: 'Loading sequence',
      type: 'object',
      group: 'chrome',
      description:
        'The boot-up animation shown on a visitor’s first page load. Status text advances with the progress bar.',
      options: {collapsible: true, collapsed: true},
      fields: [
        label('stage1', 'Status under 30%', 'CONFIGURING CORES'),
        label('stage2', 'Status 30-65%', 'LOADING PORTFOLIO DATA'),
        label('stage3', 'Status 65-90%', 'DECRYPTING MEDIA'),
        label('stage4', 'Status 90-99%', 'FINALIZING INTERFACE'),
        label('stageComplete', 'Status at 100%', 'BOOT COMPLETE'),
        label('bypassLabel', 'Skip button', '[ BYPASS SEQUENCE ]'),
        label('bypassingLabel', 'Skip button, while skipping', 'BYPASSING'),
        label('grantedLabel', 'Skip button, when done', '[ ACCESS GRANTED ]'),
      ],
    }),

    // ── 404 ────────────────────────────────────────────────────
    defineField({
      name: 'notFound',
      title: '404 page',
      type: 'object',
      group: 'errors',
      options: {collapsible: true, collapsed: false},
      fields: [
        label('heading', 'Heading', 'Page not found'),
        defineField({
          name: 'body',
          title: 'Body text',
          type: 'text',
          rows: 3,
          initialValue:
            'This page does not exist, or it moved. If you followed a link to a project, try the projects index.',
        }),
        label('homeLabel', 'Home link', 'Home'),
        label('projectsLabel', 'Projects link', 'All projects'),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'UI Text'}),
  },
})
