import Link from 'next/link'
import { Home } from 'lucide-react'
import { getUiText } from '@/lib/sanity/queries'

/**
 * 404.
 *
 * Next.js serves this with a real HTTP 404 status, which the old SPA could
 * not do — every unknown path returned 200 with client-rendered "not found"
 * text, so crawlers indexed them as valid pages (soft 404s).
 */
export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const ui = await getUiText()

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="mx-auto max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="font-garamond text-6xl font-medium tracking-tighter text-white md:text-8xl">
            404
          </h1>
          <h2 className="font-garamond text-2xl font-medium tracking-tight text-zinc-300 md:text-3xl">
            {ui.notFound.heading}
          </h2>
          <p className="font-mono text-xs leading-relaxed text-zinc-500 sm:text-sm">
            {ui.notFound.body}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 border-b border-zinc-700 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-white hover:text-white"
          >
            <Home className="h-3 w-3" />
            <span>{ui.notFound.homeLabel}</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 border-b border-zinc-800 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:border-white hover:text-white"
          >
            <span>{ui.notFound.projectsLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
