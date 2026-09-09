import {defineField, defineType} from 'sanity'

/**
 * FAQ — question and answer pairs.
 *
 * These do double duty:
 *
 *   1. They render as visible text on the page. This matters: Google only
 *      honours FAQ structured data when the same question and answer are
 *      actually readable by a visitor, and an AI assistant can only quote
 *      text it can see.
 *   2. They generate FAQPage JSON-LD.
 *
 * Write the questions the way a person would type them into a search box or
 * ask an assistant. "Who is Ashikul Bari Chowdhury?" beats "About me".
 * Answer in complete sentences that stand on their own without the question,
 * because an assistant will often lift the answer alone.
 */
export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description:
        'Phrase it as a real search query or spoken question, ending in a question mark.',
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 5,
      description:
        'Two to four complete sentences. Lead with the direct answer, then add detail. Make it readable on its own: assistants frequently quote the answer without the question. Avoid "as mentioned above" or any reference to the rest of the page.',
      validation: (Rule) =>
        Rule.required()
          .min(80)
          .warning('Very short answers rarely get picked up as a snippet or quoted by an assistant.'),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description:
        'Lowest first. Put the question you most want to own at the top: "Who is <your name>?" is usually the one worth ranking for.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      description: 'Keep the document but leave it off the page and out of structured data.',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'question', subtitle: 'order' },
    prepare({ title, subtitle }) {
      return { title, subtitle: typeof subtitle === 'number' ? `#${subtitle}` : undefined }
    },
  },
})
