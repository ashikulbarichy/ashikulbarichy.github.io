import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';
import { getProjects, getProjectCategories, getProjectStats } from '../../lib/mock-data';
import type { Project } from '../../types';
import InteractiveCanvas from '../InteractiveCanvas';
import GrainOverlay from '../ui/GrainOverlay';
import NavMenu from '../ui/NavMenu';
import { getCoverflowStyle } from '../../utils/coverflowStyle';
import { gsap } from 'gsap';
import { getMenuData, defaultMenuData } from '../../data/landing-page';
import type { MenuData } from '../../types';
import { useDataRefresh } from '../../hooks/useDataRefresh';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const WHEEL_COOLDOWN = 400;  // ms cooldown between wheel advances
const DRAG_THRESHOLD = 80;   // px to commit a drag-swipe

interface ProjectsGridProps {
  selectedCategory: string;
  onFilterChange: (category: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const ProjectsGrid = ({ selectedCategory, onFilterChange }: ProjectsGridProps) => {
  const [projects,      setProjects]     = useState<Project[]>([]);
  const [categories,    setCategories]   = useState<string[]>([]);
  const [stats,         setStats]        = useState({ totalProjects: 0, totalTechnologies: 0 });
  const [isLoading,     setIsLoading]    = useState(true);
  const [activeIndex,   setActiveIndex]  = useState(0);
  const [dragDelta,     setDragDelta]    = useState(0);
  const [isDragging,    setIsDragging]   = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuData, setMenuData] = useState<MenuData>(defaultMenuData);

  const navigate   = useNavigate();
  const refreshKey = useDataRefresh();

  // Load menu data
  useEffect(() => {
    let alive = true;
    getMenuData().then((data) => { if (alive) setMenuData(data); });
    return () => { alive = false; };
  }, [refreshKey]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (href === '#') {
      navigate('/');
      return;
    }

    // Already on /projects — do nothing for project links
    if (href === '#featured-projects' || href === '/projects' || href === '#projects') {
      return;
    }

    navigate('/' + href);
  }, [navigate]);

  const containerRef  = useRef<HTMLDivElement>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const rightColRef   = useRef<HTMLDivElement>(null);
  const dragStartRef  = useRef(0);
  const isDraggingRef = useRef(false);
  const wheelLockRef  = useRef(false);
  const projectsRef   = useRef<Project[]>([]);
  // GSAP ctx refs so we can revert between index changes
  const detailCtxRef  = useRef<gsap.Context | null>(null);

  useEffect(() => { projectsRef.current = projects; }, [projects]);


  // ── Data loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    (async () => {
      try {
        const [{ projects: all }, cats, st] = await Promise.all([
          getProjects({ category: selectedCategory === 'all' ? undefined : selectedCategory }),
          getProjectCategories(),
          getProjectStats(),
        ]);
        if (!alive) return;
        setProjects(all);
        setCategories(cats);
        setStats({ totalProjects: st.totalProjects, totalTechnologies: st.totalTechnologies });
        setIsLoading(false);
        setActiveIndex(0);
        setDragDelta(0);
      } catch (e) {
        console.error(e);
        if (alive) setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedCategory, refreshKey]);

  // ── Navigation helpers ───────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setActiveIndex(prev => Math.min(prev + 1, projectsRef.current.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const onDragStart = useCallback((clientX: number) => {
    isDraggingRef.current = true;
    dragStartRef.current  = clientX;
    setIsDragging(true);
    setDragDelta(0);
  }, []);

  const onDragMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;
    setDragDelta(clientX - dragStartRef.current);
  }, []);

  const onDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragDelta(prev => {
      if (prev < -DRAG_THRESHOLD) goNext();
      else if (prev > DRAG_THRESHOLD) goPrev();
      return 0;
    });
  }, [goNext, goPrev]);

  // Global pointer tracking
  useEffect(() => {
    const onMove  = (e: MouseEvent) => onDragMove(e.clientX);
    const onUp    = ()              => onDragEnd();
    const onTMove = (e: TouchEvent) => { if (e.touches[0]) onDragMove(e.touches[0].clientX); };
    const onTEnd  = ()              => onDragEnd();
    window.addEventListener('mousemove',   onMove);
    window.addEventListener('mouseup',     onUp);
    window.addEventListener('touchmove',   onTMove, { passive: true });
    window.addEventListener('touchend',    onTEnd);
    window.addEventListener('touchcancel', onTEnd);
    return () => {
      window.removeEventListener('mousemove',   onMove);
      window.removeEventListener('mouseup',     onUp);
      window.removeEventListener('touchmove',   onTMove);
      window.removeEventListener('touchend',    onTEnd);
      window.removeEventListener('touchcancel', onTEnd);
    };
  }, [onDragMove, onDragEnd]);

  // ── Wheel handler (hijack for card navigation) ───────────────────────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (projectsRef.current.length === 0) return;

      // Normalize scroll delta across browsers (especially Firefox line scrolling)
      let dy = e.deltaY;
      let dx = e.deltaX;
      if (e.deltaMode === 1) { // Line mode
        dy *= 40;
        dx *= 40;
      } else if (e.deltaMode === 2) { // Page mode
        dy *= 800;
        dx *= 800;
      }

      const d = Math.abs(dy) > Math.abs(dx) ? dy : dx;
      if (Math.abs(d) < 10) return; // filter tiny/accidental scrolls

      e.preventDefault();
      e.stopPropagation();

      if (wheelLockRef.current) return;
      wheelLockRef.current = true;

      if (d > 0) goNext(); else goPrev();

      setTimeout(() => {
        wheelLockRef.current = false;
      }, WHEEL_COOLDOWN); // WHEEL_COOLDOWN is responsive and prevents runaway scrolling
    };

    // Capture phase intercepts wheel events before any other elements or Lenis handles them
    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, [goNext, goPrev]);

  // ── GSAP Page Entrance Sequence ──────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      // Master timeline — chained sequence
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Header slides down
      tl.fromTo('.pg-header-item',
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.1 }
      )
      // 2. Left column (coverflow area) sweeps in from left
      .fromTo('.pg-left-col',
        { opacity: 0, x: -48, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 0.85 },
        '-=0.45'
      )
      // 3. Right column sweeps in from right
      .fromTo('.pg-right-col',
        { opacity: 0, x: 48 },
        { opacity: 1, x: 0, duration: 0.85 },
        '-=0.75'
      )
      // 4. Ghost number rises up
      .fromTo('.pg-ghost-num',
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.1 },
        '-=0.65'
      )
      // 5. Right-column detail blocks stagger in
      .fromTo('.pg-detail-content',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
        '-=0.8'
      )
      // 6. Filter buttons stagger up from below
      .fromTo('.pg-filter-btn',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.055, ease: 'power2.out' },
        '-=0.65'
      )
      // 7. Nav dots + arrows fade in
      .fromTo('.pg-nav-item',
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.04 },
        '-=0.45'
      );
    }, containerRef);

    return () => ctx.revert();
  }, [isLoading]);



  // ── GSAP Text-swap sequence on activeIndex change ────────────────────────────
  // Uses a clip-path wipe + stagger to feel editorial
  useEffect(() => {
    // Kill previous context cleanly
    if (detailCtxRef.current) {
      detailCtxRef.current.revert();
    }

    detailCtxRef.current = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Ghost number cross-fades
      tl.fromTo('.pg-ghost-num',
        { opacity: 0, y: 32, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 },
        0
      )
      // Each detail block clips up from the bottom — like a typewriter reveal
      .fromTo('.pg-detail-content',
        { opacity: 0, y: 20, clipPath: 'inset(100% 0% 0% 0%)' },
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.55,
          stagger: 0.07,
        },
        0.05
      );
    });

    return () => {
      if (detailCtxRef.current) {
        detailCtxRef.current.revert();
        detailCtxRef.current = null;
      }
    };
  }, [activeIndex]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Loading screen
  // ─────────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <section className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Initialising Archive...</p>
        </div>
      </section>
    );
  }

  const filterList = [
    { id: 'all', label: 'All Projects' },
    ...categories.map(cat => ({ id: cat.toLowerCase().replace(/\s+/g, '-'), label: cat })),
  ];

  const current = projects[activeIndex] ?? null;

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-black text-white relative flex flex-col overflow-hidden select-none"
    >
      <style>{`.no-sb::-webkit-scrollbar{display:none}`}</style>

      <InteractiveCanvas particlesCount={30} />
      <GrainOverlay opacity="opacity-[0.05]" />
      {/* Dot grid — matches Hero left column */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Fixed header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 sm:px-10 sm:py-8 md:px-12 md:py-8 pointer-events-none">
        {/* Brand Name on the Left */}
        <div className="pg-header-item opacity-0 pointer-events-auto">
          <Link
            to="/"
            className="font-garamond text-3xl font-bold tracking-tight text-white hover:opacity-100 transition-opacity group"
          >
            <span>ashikul</span>
            <span className="text-zinc-500 group-hover:text-white transition-colors duration-300 inline-block group-hover:translate-x-0.5 transform duration-300">.</span>
          </Link>
        </div>

        {/* Stats and Hamburger Menu on the Right */}
        <div className="pg-header-item opacity-0 pointer-events-auto flex items-center gap-6">
          <div className="hidden sm:flex gap-5 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <span>[ {stats.totalProjects} projects ]</span>
            <span>[ {stats.totalTechnologies} techs ]</span>
          </div>
          <div 
            className="flex flex-col gap-1.5 cursor-pointer group" 
            onClick={() => setIsMenuOpen(true)} 
            title="Open Menu"
          >
            <span className="w-6 h-[1.5px] bg-white transition-all duration-300 group-hover:w-4" />
            <span className="w-6 h-[1.5px] bg-white transition-all duration-300 group-hover:w-5" />
          </div>
        </div>
      </header>

      {/* ── Two-column body: 3/5 + 2/5 ── */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden pt-[72px] pb-[64px]">

        {/* ══ LEFT COLUMN — 3/5 — Coverflow ══════════════════════════════════ */}
        <div
          className="pg-left-col opacity-0 w-full md:w-[60%] h-[50vh] md:h-full relative overflow-hidden border-b md:border-b-0 md:border-r border-zinc-900 flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: '#08080a' }}
          onMouseDown={e => { if (e.button === 0) onDragStart(e.clientX); }}
          onTouchStart={e => { if (e.touches[0]) onDragStart(e.touches[0].clientX); }}
        >
          {/* Ambient centre glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 65% 55% at 50% 52%, rgba(255,255,255,0.045) 0%, transparent 70%)',
            }}
          />

          {/* Ghost number — large editorial Garamond serif outline */}
          {current && (
            <div
              className="pg-ghost-num absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
              aria-hidden
            >
              <span
                className="font-garamond font-bold leading-none"
                style={{
                  fontSize: 'clamp(8rem, 20vw, 16rem)',
                  WebkitTextStroke: '1px rgba(255,255,255,0.045)',
                  color: 'transparent',
                  userSelect: 'none',
                }}
              >
                {String(activeIndex + 1).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* ── Coverflow track ── */}
          {/* 
            Card size: 16:9 aspect ratio.
            We make the container a specific width and height derived from 16:9.
            The cards are absolutely positioned inside this container.
          */}
          <div
            ref={trackRef}
            className="relative"
            style={{
              /* max-width drives the card size; height is always 9/16 of that */
              width:  'min(500px, 78%)',
              aspectRatio: '16 / 9',
            }}
          >
            {projects.map((project, index) => {
              const style = getCoverflowStyle(index, activeIndex, dragDelta, isDragging);
              return (
                <div
                  key={project.id}
                  style={style}
                  onClick={() => {
                    if (index !== activeIndex) { setActiveIndex(index); }
                  }}
                >
                  <div
                    className="w-full h-full rounded-sm overflow-hidden relative"
                    style={{ border: '1px solid rgba(255,255,255,0.075)' }}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover pointer-events-none"
                      draggable={false}
                      style={{ transform: 'scale(1.04)' }}
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-200 bg-black/80 px-2 py-0.5 border border-zinc-700/80 rounded-sm">
                        {project.category}
                      </span>
                    </div>

                    {/* Title strip at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                      <h4 className="font-garamond text-base md:text-lg font-semibold text-white leading-tight truncate">
                        {project.title}
                      </h4>
                      <p className="font-mono text-[8px] text-zinc-500 mt-0.5 uppercase tracking-widest">{project.date}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-700">No projects match filter.</p>
              </div>
            )}
          </div>

          {/* Pill dots only (arrows removed per user request) */}
          {projects.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
              <div className="flex items-center gap-1.5">
                {projects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Go to project ${i + 1}`}
                    className="pg-nav-item opacity-0"
                    style={{
                      width:        i === activeIndex ? 20 : 5,
                      height:       5,
                      borderRadius: 3,
                      background:   i === activeIndex ? '#fff' : '#3f3f46',
                      transition:   'width 0.35s ease, background 0.35s ease',
                      display:      'block',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT COLUMN — 2/5 — Editorial detail panel ════════════════════ */}
        {/* Lenis smooth-scrolls this panel internally */}
        <div
          ref={rightColRef}
          className="pg-right-col opacity-0 w-full md:w-[40%] h-[50vh] md:h-full relative flex flex-col justify-between p-6 sm:p-10 md:p-12 bg-black text-right items-end overflow-y-auto no-sb"
        >
          {/* Top row — label + fraction */}
          <div className="flex w-full justify-between items-center pb-5 border-b border-zinc-900 flex-none">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
              [ Project Archive ]
            </span>
            <span className="font-garamond font-bold text-2xl text-zinc-500 select-none tabular-nums">
              {activeIndex + 1}/{projects.length}
            </span>
          </div>

          {/* Details — GSAP text-swap targets */}
          {current ? (
            <div className="flex-1 flex flex-col justify-center items-end gap-6 py-6 w-full ml-auto">

              {/* Category */}
              <div className="pg-detail-content w-full">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600 block mb-1">Category</span>
                <span className="font-mono text-xs text-zinc-400">{current.category}</span>
              </div>

              {/* Title — large Garamond */}
              <div className="pg-detail-content border-b border-zinc-900 pb-5 w-full">
                <h2 className="font-garamond text-2xl sm:text-3xl lg:text-[2.4rem] font-medium tracking-tight leading-tight text-white text-right">
                  {current.title}
                </h2>
              </div>

              {/* Tech stack */}
              <div className="pg-detail-content w-full flex flex-col items-end gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Tech Stack</span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {current.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[9px] font-mono rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Overview */}
              <div className="pg-detail-content w-full flex flex-col items-end gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Overview</span>
                <p className="font-mono text-zinc-400 text-xs sm:text-[0.8rem] leading-relaxed text-right">
                  {current.description}
                </p>
              </div>



              {/* Action links — exact home-page style */}
              <div className="pg-detail-content flex gap-5 items-center justify-end">
                <a
                  href={current.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border-b border-zinc-800 hover:border-white pb-0.5 font-mono group"
                >
                  <span>GitHub Code</span>
                  <Github className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </a>
                {current.projectUrl && (
                  <a
                    href={current.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border-b border-zinc-800 hover:border-white pb-0.5 font-mono group"
                  >
                    <span>Live Site</span>
                    <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </a>
                )}
              </div>


            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-700">No projects match filter.</p>
            </div>
          )}

          {/* Bottom hint */}
          <div className="w-full flex justify-end pt-4 border-t border-zinc-900 flex-none">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-700">
              drag · scroll · click side cards
            </span>
          </div>
        </div>
      </main>

      {/* ── Filter bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-900 bg-black/95 backdrop-blur-xl py-4 px-6 z-30 flex justify-center overflow-x-auto no-sb">
        <div className="flex gap-2 items-center flex-nowrap whitespace-nowrap">
          {filterList.map(f => {
            const active = (selectedCategory === 'all' && f.id === 'all')
              || selectedCategory.toLowerCase() === f.label.toLowerCase();
            return (
              <button
                key={f.id}
                onClick={() => onFilterChange(f.id === 'all' ? 'all' : f.label)}
                className={`pg-filter-btn opacity-0 px-4 py-1.5 font-mono text-[9px] uppercase tracking-widest border transition-all duration-300 rounded-sm cursor-pointer ${
                  active
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-zinc-600 border-zinc-900 hover:text-white hover:border-zinc-700'
                }`}
              >
                [ {f.label} ]
              </button>
            );
          })}
        </div>
      </footer>



      {/* ── Nav Menu Overlay ── */}
      <NavMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuData={menuData}
        onNavClick={handleNavClick}
      />
    </div>
  );
};

export default ProjectsGrid;