import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import {
  getIdentity,
  getSiteSettings,
  getProjectBySlug,
  getIndexableProjects,
  getUiText,
} from '@/lib/sanity/queries'
import { withPageSeo } from '@/lib/seo/metadata'
import { projectJsonLd, breadcrumbJsonLd, jsonLdScript } from '@/lib/seo/jsonld'

interface Params {
  params: { slug: string }
}

/**
 * Pre-render every indexable project at build time. New projects published in
 * Sanity are rendered on first request and then cached, so this does not need
 * a redeploy to pick them up.
 */
export async function generateStaticParams() {
  const projects = await getIndexableProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const [project, settings, identity] = await Promise.all([
    getProjectBySlug(params.slug),
    getSiteSettings(),
    getIdentity(),
  ])

  if (!project) {
    return { title: 'Project not found', robots: { index: false, follow: false } }
  }

  return withPageSeo(
    {
      settings,
      identity,
      path: `/projects/${project.slug}`,
      title: `${project.title} — ${identity.fullName}`,
      description: project.summary || project.description,
      imageUrl: project.image || null,
      imageAlt: project.imageAlt || project.title,
      type: 'article',
      publishedTime: project.publishedAt,
      modifiedTime: project.updatedAt,
    },
    project.seo
  )
}

const portableComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 font-mono text-sm leading-relaxed text-zinc-400">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-12 font-garamond text-2xl font-medium tracking-tight text-white sm:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 font-garamond text-xl font-medium tracking-tight text-white sm:text-2xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l border-zinc-700 pl-5 font-garamond text-lg italic text-zinc-300">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 list-disc space-y-2 pl-5 font-mono text-sm text-zinc-400">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-5 font-mono text-sm text-zinc-400">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-zinc-200">{children}</strong>,
    code: ({ children }) => (
      <code className="rounded-sm border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[0.8em] text-zinc-300">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-200 underline decoration-zinc-700 underline-offset-2 hover:decoration-white"
      >
        {children}
      </a>
    ),
  },
}

export default async function ProjectPage({ params }: Params) {
  const [project, identity, ui] = await Promise.all([
    getProjectBySlug(params.slug),
    getIdentity(),
    getUiText(),
  ])

  if (!project) notFound()

  const graph = [
    projectJsonLd(project, identity),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Projects', path: '/projects' },
      { name: project.title, path: `/projects/${project.slug}` },
    ]),
  ]

  const meta = [
    project.role && { label: ui.projectDetail.roleLabel, value: project.role },
    project.category && { label: ui.projectDetail.categoryLabel, value: project.category },
    project.duration && { label: ui.projectDetail.durationLabel, value: project.duration },
    project.date && { label: ui.projectDetail.dateLabel, value: project.date },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <>
      {graph.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(node) }}
        />
      ))}

      <article className="relative min-h-screen w-full bg-black px-6 pb-24 pt-28 sm:px-10 md:px-16 md:pt-36">
        <div className="mx-auto w-full max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-10">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span>{ui.projectDetail.backLabel}</span>
            </Link>
          </nav>

          <header className="mb-12 border-b border-zinc-900 pb-10">
            {project.category && (
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                {project.category}
              </p>
            )}
            <h1 className="mb-6 font-garamond text-4xl font-medium leading-[0.95] tracking-tighter text-white sm:text-5xl md:text-6xl">
              {project.title}
            </h1>
            {project.summary && (
              <p className="max-w-2xl font-mono text-sm leading-relaxed text-zinc-400">
                {project.summary}
              </p>
            )}

            {(project.projectUrl || project.githubUrl) && (
              <div className="mt-8 flex flex-wrap items-center gap-5">
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 border-b border-zinc-700 pb-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-white hover:text-white"
                  >
                    <span>{ui.projectDetail.liveSiteLabel}</span>
                    <ExternalLink className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 border-b border-zinc-800 pb-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500 transition-colors hover:border-white hover:text-white"
                  >
                    <span>{ui.projectDetail.sourceLabel}</span>
                    <Github className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </div>
            )}
          </header>

          {project.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={project.image}
              alt={project.imageAlt || `${project.title} screenshot`}
              className="mb-14 w-full rounded-sm border border-zinc-900"
              loading="lazy"
            />
          )}

          {meta.length > 0 && (
            <dl className="mb-14 grid grid-cols-2 gap-x-8 gap-y-6 border-b border-zinc-900 pb-10 sm:grid-cols-4">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                    {item.label}
                  </dt>
                  <dd className="font-mono text-xs text-zinc-300">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {project.highlights.length > 0 && (
            <section aria-labelledby="highlights" className="mb-14">
              <h2
                id="highlights"
                className="mb-5 font-garamond text-2xl font-medium tracking-tight text-white"
              >
                {ui.projectDetail.highlightsLabel}
              </h2>
              <ul className="space-y-3">
                {project.highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 font-mono text-sm leading-relaxed text-zinc-400">
                    <span className="flex-none text-zinc-600">
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* The long write-up. Falls back to the plain description so a project
              without a body still renders real prose rather than an empty page. */}
          <div className="mb-14">
            {Array.isArray(project.body) && project.body.length > 0 ? (
              <PortableText value={project.body as never} components={portableComponents} />
            ) : (
              project.description && (
                <p className="font-mono text-sm leading-relaxed text-zinc-400">
                  {project.description}
                </p>
              )
            )}
          </div>

          {project.tags.length > 0 && (
            <section aria-labelledby="stack" className="border-t border-zinc-900 pt-10">
              <h2
                id="stack"
                className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600"
              >
                {ui.projectDetail.techStackLabel}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-sm border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[10px] text-zinc-300"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </>
  )
}
