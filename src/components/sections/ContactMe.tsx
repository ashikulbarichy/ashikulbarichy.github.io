import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InteractiveCanvas from '../InteractiveCanvas';
import GrainOverlay from '../ui/GrainOverlay';
import { getLandingData, defaultLandingData, getMenuData, defaultMenuData } from '../../data/landing-page';
import type { LandingPageData, MenuData } from '../../types';
import { useDataRefresh } from '../../hooks/useDataRefresh';

gsap.registerPlugin(ScrollTrigger);

const ContactMe = () => {
  const refreshKey = useDataRefresh();

  const [landingData, setLandingData] = useState<LandingPageData>(defaultLandingData);
  const [menuData,    setMenuData]    = useState<MenuData>(defaultMenuData);

  const contactRef = useRef<HTMLDivElement>(null);

  // ── Data fetching (with auto-refresh) ─────────────────────────────────────
  useEffect(() => {
    let alive = true;
    getLandingData().then((data) => { if (alive) setLandingData(data); });
    getMenuData().then((data)    => { if (alive) setMenuData(data); });
    return () => { alive = false; };
  }, [refreshKey]);

  // ── Entrance animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!contactRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: contactRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
      tl.fromTo('.contact-anim-stagger',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15 },
      );
    }, contactRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={contactRef}
      id="contact"
      className="relative w-full bg-black border-t border-zinc-900 md:h-screen flex flex-col md:flex-row overflow-hidden"
    >
      {/* LEFT COLUMN: Static Info */}
      <div className="w-full md:w-[40%] flex flex-col justify-between p-8 sm:p-12 md:p-16 border-b md:border-b-0 md:border-r border-zinc-900 flex-none h-[35vh] md:h-full bg-black z-20">
        <h2 className="contact-anim-stagger opacity-0 text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-garamond font-medium tracking-tighter leading-[0.85] text-white my-auto">
          Get in<br />touch
        </h2>
        <span className="contact-anim-stagger opacity-0 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500">
          {landingData.heroLocation === 'Dhaka, Bangladesh' ? 'Dhaka, Bangladesh — GMT+6' : landingData.heroLocation}
        </span>
      </div>

      {/* RIGHT COLUMN: Interactive Details */}
      <div className="w-full md:w-[60%] flex-none flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-black z-10 text-left items-start transition-all duration-300 relative overflow-hidden h-[55vh] md:h-full border-zinc-900">
        <InteractiveCanvas particlesCount={50} />
        <GrainOverlay />

        {/* Email link */}
        <div className="contact-anim-stagger opacity-0 w-full my-auto py-6 relative z-10">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
            Direct Email
          </span>
          <a
            href={`mailto:${menuData.email}`}
            className="group inline-flex items-center gap-3 text-xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-[3.25rem] font-garamond font-medium tracking-tight text-white hover:text-zinc-350 transition-colors duration-300 leading-none break-all"
          >
            <span>{menuData.email}</span>
            <ArrowUpRight className="h-5 w-5 sm:h-7 sm:w-7 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0" />
          </a>
        </div>

        {/* Footer row */}
        <div className="contact-anim-stagger opacity-0 w-full flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-t border-zinc-900/60 pt-6 relative z-10">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Availability</span>
            <span className="font-mono text-[10px] sm:text-xs text-zinc-300">
              Open for opportunities (expected response within 24h)
            </span>
          </div>
          <div className="flex gap-4">
            {menuData.socialLinks?.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white border-b border-zinc-800 hover:border-white pb-0.5 transition-all"
              >
                [ {social.platform} ]
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactMe;