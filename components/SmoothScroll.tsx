'use client'

import { usePathname } from 'next/navigation'
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: React.ReactNode;
}

function RouteScrollToTop() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    // Sync GSAP ticker with Lenis raf method
    const updateRaf = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(updateRaf);

    // Disable GSAP lag smoothing to keep scroll in perfect sync
    gsap.ticker.lagSmoothing(0);

    // Sync Lenis scroll with ScrollTrigger
    const lenisInstance = lenisRef.current?.lenis;
    if (lenisInstance) {
      lenisInstance.on('scroll', ScrollTrigger.update);
    }

    return () => {
      gsap.ticker.remove(updateRaf);
      if (lenisInstance) {
        lenisInstance.off('scroll', ScrollTrigger.update);
      }
    };
  }, []);

  return (
    <ReactLenis 
      ref={lenisRef} 
      root 
      autoRaf={false}
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      <RouteScrollToTop />
      {children}
    </ReactLenis>
  );
}
