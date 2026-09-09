import type { Metadata } from 'next'
import Link from 'next/link'
import ProjectsView from '@/components/projects/ProjectsView'
import {
  getIdentity,
  getSiteSettings,
  getMenuData,
  getProjects,
  getIndexableProjects,
  getProjectCategories,
  getUiText,
} from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo/metadata'
import {
  collectionPageJsonLd,
  breadcrumbJsonLd,
  jsonLdScript,
} from '@/lib/seo/jsonld'

/**
 * ISR: re-render at most once every 60 seconds.
 *
 * Without this the route is fully static — Next bakes the HTML at build time
 * and serves it from the Full Route Cache indefinitely, so a Sanity edit only
 * appeared after a redeploy. The `revalidate` on the data functions in
 * lib/sanity/queries.ts was not enough on its own: that governs the cached
 * query result, not whether the page is ever rendered again.
 *
 * The webhook at /api/revalidate is still the fast path (seconds, by tag).
 * This is the floor that guarantees freshness when the webhook is not
 * configured or a delivery fails.
 */
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const [settings, identity, projects] = await Promise.all([
    getSiteSettings(),
    getIdentity(),
    getIndexableProjects(),
  ])

  // Build the description from what is actually there rather than a fixed
  // string. The old version claimed healthcare systems, financial dashboards
  // and Python security tooling that no project in the CMS backs up; a
  // description that oversells what the page contains gets rewritten by Google
  // and erodes trust with assistants that can read the page.
  const techs = Array.from(new Set(projects.flatMap((p) => p.tags))).slice(0, 6)
  const description = projects.length
    ? `${projects.length} project${projects.length === 1 ? '' : 's'} by ${identity.fullName}, ${identity.headline.toLowerCase()} in ${identity.locality}. Built with ${techs.join(', ')}.`
    : `Selected work by ${identity.fullName}, ${identity.headline.toLowerCase()} in ${identity.locality}.`

  return buildMetadata({
    settings,
    identity,
    path: '/projects',
    title: `Projects — ${identity.fullName}`,
    description,
    type: 'website',
  })
}

export default async function ProjectsPage() {
  const [identity, projects, indexable, categories, menuData, ui] = await Promise.all([
    getIdentity(),
    getProjects(),
    getIndexableProjects(),
    getProjectCategories(),
    getMenuData(),
    getUiText(),
  ])

  const graph = [
    collectionPageJsonLd({
      path: '/projects',
      name: `Projects — ${identity.fullName}`,
      description: `Selected work by ${identity.fullName}.`,
      items: indexable,
    }),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Projects', path: '/projects' },
    ]),
  ]

  return (
    <>
      {graph.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(node) }}
        />
      ))}

      <ProjectsView projects={projects} categories={categories} menuData={menuData} ui={ui} />

      {/*
        A plain server-rendered index of every project.

        The carousel above is the experience, but it is a single-item detail
        view driven by client state, so only the active project links out. This
        list guarantees every project page has a real internal link from a
        crawlable page, and gives visitors a way to scan everything at once.
      */}
      {indexable.length > 0 && (
        <section
          aria-labelledby="all-projects-heading"
          className="relative w-full border-t border-zinc-900 bg-black px-6 py-16 sm:px-10 md:px-16 md:py-24"
        >
          <div className="mx-auto w-full max-w-5xl">
            <h2
              id="all-projects-heading"
              className="mb-10 font-garamond text-3xl font-medium tracking-tighter text-white sm:text-4xl md:text-5xl"
            >
              {ui.projects.allProjectsHeading}
            </h2>
            <ul className="divide-y divide-zinc-900 border-y border-zinc-900">
              {indexable.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex flex-col gap-2 py-6 transition-colors hover:bg-zinc-950/40 sm:flex-row sm:items-baseline sm:gap-8"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-garamond text-xl font-medium tracking-tight text-white transition-transform duration-300 group-hover:translate-x-1 sm:text-2xl">
                        {project.title}
                      </span>
                      {project.summary && (
                        <span className="mt-1.5 block max-w-2xl font-mono text-xs leading-relaxed text-zinc-500">
                          {project.summary}
                        </span>
                      )}
                    </span>
                    <span className="flex flex-none flex-wrap gap-1.5">
                      {project.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-sm border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[9px] text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
