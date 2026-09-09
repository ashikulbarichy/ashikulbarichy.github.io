import type { Faq, UiText } from '@/lib/types'

/**
 * FAQ section.
 *
 * A server component built on <details>/<summary>, so it needs no JavaScript
 * at all: the questions and answers are plain text in the HTML, and the
 * expand/collapse works natively.
 *
 * This is deliberate rather than incidental. FAQPage structured data is only
 * legitimate when the same Q&A is visible to a visitor — Google treats
 * markup-only FAQs as a structured data violation, and an AI assistant can
 * only quote text it can actually read. So this section is the visible half of
 * the FAQPage JSON-LD emitted on the same page.
 */
export default function FaqSection({ faqs, ui }: { faqs: Faq[]; ui: UiText }) {
  if (!faqs.length) return null

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative w-full bg-black border-t border-zinc-900 px-6 py-20 sm:px-10 sm:py-24 md:px-16 md:py-32"
    >
      <div className="mx-auto w-full max-w-4xl">
        <h2
          id="faq-heading"
          className="mb-12 font-garamond text-4xl font-medium leading-[0.9] tracking-tighter text-white sm:mb-16 sm:text-5xl md:text-6xl"
        >
          {ui.faq.headingLine1}
          <br />
          {ui.faq.headingLine2}
        </h2>

        <div className="divide-y divide-zinc-900 border-y border-zinc-900">
          {faqs.map((faq, i) => (
            <details key={faq.question} className="group w-full" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 transition-colors hover:bg-zinc-950/40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-zinc-600">
                <h3 className="flex-1 font-garamond text-lg font-medium tracking-tight text-white sm:text-xl md:text-2xl">
                  <span className="mr-3 align-top font-mono text-[10px] text-zinc-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {faq.question}
                </h3>
                {/* Rotates off the native open state — no JS required. */}
                <span
                  aria-hidden="true"
                  className="mt-1.5 select-none font-mono text-lg leading-none text-zinc-500 transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-3xl pb-7 pr-10 font-mono text-xs leading-relaxed text-zinc-400 sm:pl-10 sm:text-sm">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
