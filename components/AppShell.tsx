'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SmoothScroll } from './SmoothScroll'
import LoadingScreen from './LoadingScreen'
import type { UiText } from '@/lib/types'
import 'lenis/dist/lenis.css'

/**
 * AppShell.
 *
 * One important difference from the old Vite App.tsx: the page content is
 * ALWAYS rendered into the DOM. Previously the loading screen replaced the
 * content and `<main>` was held at opacity 0 until a client-side timer
 * finished, which meant the markup a crawler saw depended on JavaScript
 * having run.
 *
 * Now the loading screen is a fixed overlay painted on top of content that is
 * already there in the server-rendered HTML. Visitors get the same intro
 * animation; crawlers get the text regardless.
 */
export default function AppShell({
  children,
  loadingLabels,
}: {
  children: React.ReactNode
  loadingLabels?: UiText['loadingScreen']
}) {
  // Start false so the server-rendered HTML never contains a hidden main.
  // The effect below decides whether this visitor should see the intro.
  const [isLoading, setIsLoading] = useState(false)
  const mainContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // sessionStorage is unavailable in private modes and when site data is
    // blocked, so a failure here must not cost the visitor the page.
    try {
      if (!sessionStorage.getItem('portfolio_visited')) setIsLoading(true)
    } catch {
      /* no intro, no harm */
    }
  }, [])

  useEffect(() => {
    if (isLoading) return
    try {
      sessionStorage.setItem('portfolio_visited', 'true')
    } catch {
      /* ignore */
    }
  }, [isLoading])

  useEffect(() => {
    if (isLoading || !mainContentRef.current) return
    gsap.fromTo(
      mainContentRef.current,
      { opacity: 0, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out', clearProps: 'all' }
    )
  }, [isLoading])

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-[9999]">
          <LoadingScreen onComplete={() => setIsLoading(false)} labels={loadingLabels} />
        </div>
      )}
      <SmoothScroll>
        <div className="bg-background text-foreground antialiased relative min-h-screen">
          <div className="relative z-10">
            <main ref={mainContentRef} className="min-h-screen main-content overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </SmoothScroll>
    </>
  )
}
