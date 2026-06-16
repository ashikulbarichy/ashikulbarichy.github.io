import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InteractiveCanvas from '../InteractiveCanvas';
import GrainOverlay from '../ui/GrainOverlay';
import { getAboutSlides, defaultAboutSlides } from '../../data/landing-page';
import type { AboutSlide } from '../../types';
import { useDataRefresh } from '../../hooks/useDataRefresh';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const [activeCardIndex, setActiveCardIndex] = useState(1);
  const [disciplines, setDisciplines] = useState<AboutSlide[]>(defaultAboutSlides);
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const refreshKey = useDataRefresh();

  useEffect(() => {
    let alive = true;
    getAboutSlides().then((data) => { if (alive) setDisciplines(data); });
    return () => { alive = false; };
  }, [refreshKey]);

  useEffect(() => {
    if (disciplines.length === 0) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop layout: horizontal scroll with pinning and content fading/sliding
      mm.add('(min-width: 768px)', () => {

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            pin: stickyRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress || 0;
              const count = disciplines.length;
              if (count <= 1) {
                setActiveCardIndex(1);
                return;
              }
              let index = count;
              for (let i = 0; i < count - 1; i++) {
                const midpoint = (2 * i + 1) / (2 * (count - 1));
                if (progress < midpoint) {
                  index = i + 1;
                  break;
                }
              }
              setActiveCardIndex(index);
            }
          }
        });

        // Horizontal translation — full row including header scrolls
        tl.to(scrollRowRef.current, {
          x: () => -(scrollRowRef.current ? scrollRowRef.current.scrollWidth - window.innerWidth : 0),
          ease: 'none',
          duration: 10,
        });

        // Dynamic transitions based on disciplines count
        disciplines.forEach((_, idx) => {
          if (idx === disciplines.length - 1) return;
          
          const midpointTime = 10 * (2 * idx + 1) / (2 * (disciplines.length - 1));
          const startTime = midpointTime - 0.5;

          // Transition current card out (fade/slide up)
          tl.to(`.card-content-${idx + 1}`, {
            opacity: 0.1,
            y: -25,
            duration: 1.0,
            ease: 'power2.inOut',
          }, startTime);

          // Transition next card in (fade/slide in)
          tl.fromTo(`.card-content-${idx + 2}`,
            { opacity: 0, y: 35 },
            { opacity: 1, y: 0, duration: 1.0, ease: 'power2.inOut' },
            startTime
          );
        });
      });

      // Mobile layout: simple vertical entrance animations and scroll triggers for active highlights
      mm.add('(max-width: 767px)', () => {
        disciplines.forEach((_, idx) => {
          gsap.fromTo(`.card-content-${idx + 1}`,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: `.card-content-${idx + 1}`,
                start: 'top 90%',
                toggleActions: 'play none none none',
              }
            }
          );

          ScrollTrigger.create({
            trigger: `.card-content-${idx + 1}`,
            start: 'top 60%',
            end: 'bottom 40%',
            onToggle: (self) => {
              if (self.isActive) {
                setActiveCardIndex(idx + 1);
              }
            }
          });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [disciplines]);

  return (
    <section 
      ref={containerRef} 
      id="about" 
      className="relative w-full bg-black border-t border-zinc-900 md:h-[var(--total-height)] overflow-visible"
      style={{
        ['--total-height' as any]: `${disciplines.length * 100}vh`
      }}
    >
      {/* Sticky Content Wrapper */}
      <div 
        ref={stickyRef}
        className="relative w-full md:h-screen flex flex-col justify-between overflow-hidden z-10"
      >
        {/* Grain Overlay */}
        <GrainOverlay className="z-10" />
        <div className="flex-1 flex flex-col">
          {/* Main Flex Row — all columns including header scroll together */}
          <div 
            ref={scrollRowRef}
            className="flex flex-col md:flex-row h-full flex-none border-b border-zinc-900"
            style={{
              width: `calc(40vw + ${disciplines.length * 60}vw)`
            }}
          >
            {/* "Bytes about me" header — 2/5 of viewport */}
            <div 
              className="flex w-full md:w-[40vw] flex-col justify-between p-8 sm:p-12 md:p-16 border-b md:border-b-0 md:border-r border-zinc-900 flex-none h-[40vh] md:h-full bg-black z-20"
            >
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-garamond font-medium tracking-tighter leading-[0.85] text-white my-auto">
                Bytes<br />about me
              </h2>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-500">
                scroll to explore
              </span>
            </div>

            {/* Service Discipline Cards — each takes 3/5 of viewport (60vw) */}
            {disciplines.map((card, idx) => (
              <div 
                key={card.id || idx}
                className="group flex flex-col w-full md:w-[60vw] h-[60vh] md:h-full justify-between p-8 sm:p-12 md:p-16 border-b md:border-b-0 md:border-r border-zinc-900 flex-none relative overflow-hidden bg-black transition-colors duration-500 hover:bg-zinc-950/20"
              >
                {/* Outlined Background Typography */}
                {card.outlineText && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                    style={{
                      fontSize: '18vw',
                      fontFamily: 'system-ui, sans-serif',
                      fontWeight: 900,
                      WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.05)',
                      color: 'transparent',
                      opacity: 0.05,
                    }}
                  >
                    {card.outlineText}
                  </div>
                )}

                {/* Canvas Background */}
                <InteractiveCanvas particlesCount={20} />

                {/* Top Tag Row */}
                <div className="flex gap-3 items-center relative z-10">
                  <div className="rounded-full w-2.5 h-2.5 bg-white transition-transform duration-300 group-hover:scale-150 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-zinc-300 group-hover:translate-x-1 transition-transform duration-300">
                    {card.tag}
                  </span>
                </div>

                {/* Top Right Logo */}
                {card.logoUrl && (
                  <div 
                    className={`absolute top-8 sm:top-12 md:top-16 right-8 sm:right-12 md:right-16 z-20 flex items-center justify-center pointer-events-none select-none transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                      card.tag.toLowerCase().includes('reevolt') || card.title.toLowerCase().includes('reevolt')
                        ? 'w-16 h-4 sm:w-20 sm:h-5 md:w-24 md:h-6'
                        : 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14'
                    }`}
                    style={idx === 2 || card.tag.toLowerCase().includes('reevolt') || card.title.toLowerCase().includes('reevolt') ? { filter: 'brightness(0) invert(1)' } : undefined}
                  >
                    <img 
                      src={card.logoUrl} 
                      alt={`${card.title} logo`} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                {/* Bottom Details Row */}
                <div className={`card-content-${idx + 1} ${idx !== 0 ? 'md:opacity-0 md:translate-y-10' : ''} flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10 w-full`}>
                  <div className="flex-1 max-w-2xl">
                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-garamond font-medium tracking-tight leading-none text-white mb-4 group-hover:translate-x-2 transition-transform duration-500">
                      {card.title}
                    </h3>
                    <p className="text-zinc-300 font-mono text-xs sm:text-sm leading-relaxed text-left max-w-xl">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Axis at the bottom */}
                <div className={`absolute bottom-6 left-8 sm:left-12 md:left-16 right-8 sm:right-12 md:right-16 h-[1px] ${activeCardIndex === idx + 1 ? 'bg-zinc-700' : 'bg-zinc-900'} z-10 flex justify-between items-center px-4 transition-colors duration-500`}>
                  {card.timelinePoints.map((point, pIdx) => (
                    <div key={point + pIdx} className="relative flex flex-col items-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${activeCardIndex === idx + 1 ? 'bg-white scale-125' : 'bg-zinc-700'} transition-all duration-500`} />
                      <span className={`absolute top-2.5 font-mono text-[9px] ${activeCardIndex === idx + 1 ? 'text-zinc-300' : 'text-zinc-500'} transition-colors duration-500`}>
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counter bottom-right absolute in sticky container */}
        <div className="pointer-events-none absolute bottom-4 sm:bottom-6 md:bottom-8 right-8 sm:right-12 md:right-16 z-20 hidden md:block">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white">
            0{activeCardIndex} / 0{disciplines.length}
          </span>
        </div>
      </div>
    </section>
  );
};


export default About;