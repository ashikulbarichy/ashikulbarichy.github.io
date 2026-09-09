import type { Metadata } from 'next'

/**
 * /sam is private. Middleware also sets an X-Robots-Tag header, so the
 * dashboard is excluded at both the page and the response level.
 */
export const metadata: Metadata = {
  title: 'SAM',
  robots: { index: false, follow: false, nocache: true },
}

export default function SamLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-black text-zinc-200">{children}</div>
}
