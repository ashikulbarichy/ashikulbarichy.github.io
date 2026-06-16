import { useState, useEffect, useRef, useCallback } from 'react';
import { Download, ExternalLink, Plus, Minus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { getLandingData, defaultLandingData, getMenuData, defaultMenuData } from '../../data/landing-page';
import type { LandingPageData, MenuData } from '../../types';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import SecurityLogsBackground from './SecurityLogsBackground';
import NavMenu from '../ui/NavMenu';

const Hero = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const refreshKey = useDataRefresh();

  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [mousePos,    setMousePos]    = useState({ x: 0, y: 0 });
  const [isMenuOpen,  setIsMenuOpen]  = useState(false);
  const [landingData, setLandingData] = useState<LandingPageData>(defaultLandingData);
  const [menuData,    setMenuData]    = useState<MenuData>(defaultMenuData);
  const [imageOffset, setImageOffset] = useState<number | null>(null);

  const heroRef            = useRef<HTMLDivElement>(null);
  const rightColRef        = useRef<HTMLDivElement>(null);
  const certsContentRef    = useRef<HTMLDivElement>(null);
  const skillsContentRef   = useRef<HTMLDivElement>(null);
  const accordionsCtxRef   = useRef<gsap.Context | null>(null);
  const isAccordionInitial = useRef(true);
  const textRef            = useRef<HTMLHeadingElement>(null);
  const cardContainerRef   = useRef<HTMLDivElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    getLandingData().then((data) => { if (alive) setLandingData(data); });
    getMenuData().then((data)    => { if (alive) setMenuData(data); });
    return () => { alive = false; };
  }, [refreshKey]);

  // ── Image alignment ────────────────────────────────────────────────────────
  useEffect(() => {
    const adjustAlignment = () => {
      if (window.innerWidth >= 768 && textRef.current && heroRef.current && cardContainerRef.current) {
        const getOffsetTopRelativeTo = (el: HTMLElement, ancestor: HTMLElement): number => {
          let top = 0;
          let current: HTMLElement | null = el;
          while (current && current !== ancestor) {
            top += current.offsetTop;
            current = current.offsetParent as HTMLElement | null;
          }
          return top;
        };

        const textTop      = getOffsetTopRelativeTo(textRef.current, heroRef.current);
        const containerTop = getOffsetTopRelativeTo(cardContainerRef.current, heroRef.current);
        const paddingTop   = parseFloat(window.getComputedStyle(cardContainerRef.current).paddingTop) || 0;
        setImageOffset(Math.max(0, textTop - 20 - containerTop - paddingTop));
      } else {
        setImageOffset(null);
      }
    };

    adjustAlignment();
    window.addEventListener('resize', adjustAlignment);
    const t1 = setTimeout(adjustAlignment, 100);
    const t2 = setTimeout(adjustAlignment, 1000);
    const t3 = setTimeout(adjustAlignment, 2500);

    return () => {
      window.removeEventListener('resize', adjustAlignment);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [landingData, activeAccordion]);

  // ── Hero entrance animation ────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 1.2 });
      tl.fromTo('.hero-left-fade-stagger',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15 },
      );
      tl.fromTo('.hero-right-fade-stagger',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15 },
        '-=0.6',
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // ── Accordion GSAP context ─────────────────────────────────────────────────
  useEffect(() => {
    accordionsCtxRef.current = gsap.context(() => {});
    return () => { accordionsCtxRef.current?.revert(); };
  }, []);

  // ── Accordion animations ───────────────────────────────────────────────────
  useEffect(() => {
    if (!accordionsCtxRef.current) return;
    if (isAccordionInitial.current) {
      isAccordionInitial.current = false;
      return;
    }

    const certsEl  = certsContentRef.current;
    const skillsEl = skillsContentRef.current;

    accordionsCtxRef.current.add(() => {
      gsap.killTweensOf([certsEl, skillsEl, '.cert-item', '.skill-badge']);

      if (activeAccordion === 'certifications') {
        gsap.to(skillsEl, { height: 0, opacity: 0, duration: 0.35, ease: 'power3.inOut' });
        gsap.to(certsEl,  { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' });
        gsap.fromTo('.cert-item',
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.1, delay: 0.1 },
        );
      } else if (activeAccordion === 'skills') {
        gsap.to(certsEl,  { height: 0, opacity: 0, duration: 0.35, ease: 'power3.inOut' });
        gsap.to(skillsEl, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' });
        gsap.fromTo('.skill-badge',
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)', stagger: 0.04, delay: 0.1 },
        );
      } else {
        gsap.to([certsEl, skillsEl], { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut' });
      }
    });
  }, [activeAccordion]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (href === '#') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (href === '#featured-projects' || href === '/projects' || href === '#projects') {
      navigate('/projects');
      return;
    }

    if (location.pathname !== '/') {
      navigate('/' + href);
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, [location.pathname, navigate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (rightColRef.current) {
      const rect = rightColRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (rightColRef.current && e.touches[0]) {
      const rect = rightColRef.current.getBoundingClientRect();
      setMousePos({ x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top });
    }
  };

  const toggleAccordion = (id: string) =>
    setActiveAccordion((prev) => (prev === id ? null : id));

  const scrollToProjects = () => {
    document.querySelector('#featured-projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const downloadCV = () => {
    const link = document.createElement('a');
    link.href   = landingData.cvUrl || 'https://www.dropbox.com/scl/fi/mi6xs19gw2xd7axkzsrxn/ashikul-bari-cv.pdf?rlkey=0l4xas6blt87hsbujvwl1ggkg&st=mc03tqr4&dl=1';
    link.target = '_blank';
    link.rel    = 'noopener noreferrer';
    link.click();
  };

  return (
    <section ref={heroRef} className="min-h-screen w-full flex flex-col md:flex-row relative bg-black overflow-hidden">

      {/* Fixed Header Row */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-6 sm:px-10 sm:py-8 md:px-12 md:py-8 pointer-events-none">
        {/* Brand Name */}
        <div className="hero-left-fade-stagger opacity-0 pointer-events-auto">
          <a
            href="#"
            onClick={(e) => handleNavClick(e, '#')}
            className="font-garamond text-3xl font-bold tracking-tight text-white hover:opacity-100 transition-opacity group"
          >
            <span>{menuData.brandFirst}</span>
            <span className="text-zinc-500 group-hover:text-white transition-colors duration-300 inline-block group-hover:translate-x-0.5 transform duration-300">
              {menuData.brandLast}
            </span>
          </a>
        </div>

        {/* Hamburger */}
        <div className="hero-right-fade-stagger opacity-0 pointer-events-auto">
          <div
            className="flex flex-col gap-1.5 cursor-pointer group"
            onClick={() => setIsMenuOpen(true)}
            title="Open Menu"
          >
            <span className="w-6 h-[1.5px] bg-white transition-all duration-300 group-hover:w-4" />
            <span className="w-6 h-[1.5px] bg-white transition-all duration-300 group-hover:w-5" />
          </div>
        </div>
      </div>

      {/* LEFT COLUMN */}
      <div
        className="w-full md:w-2/5 pt-16 md:pt-0 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-zinc-900 md:pb-[128px]"
        style={{
          backgroundColor: '#0c0c0e',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <SecurityLogsBackground />

        {/* Profile card */}
        <div
          ref={cardContainerRef}
          className="hero-left-fade-stagger opacity-0 relative z-10 flex-1 min-h-[400px] md:min-h-[480px] w-full flex items-center md:items-start justify-center p-6 group"
        >
          <div
            style={imageOffset !== null ? { marginTop: `${imageOffset}px` } : undefined}
            className="bg-white text-black p-4 sm:p-5 w-[280px] sm:w-[320px] shadow-2xl border border-zinc-200 flex flex-col rounded-sm transition-transform duration-500 hover:scale-[1.02]"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-zinc-100 border border-zinc-200/60 mb-4 rounded-sm">
              <img
                src={landingData.profilePicUrl}
                alt={`${landingData.heroName} Portrait`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-center text-[10px] sm:text-xs">
                <span className="tracking-[0.15em] font-medium uppercase font-inter text-zinc-500">
                  {landingData.heroRole}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion widgets */}
        <div className="hero-left-fade-stagger opacity-0 w-full bg-black border-t border-zinc-800 md:absolute md:bottom-0 md:left-0 md:z-20">

          {/* Certifications */}
          <div className="w-full">
            <button
              onClick={() => toggleAccordion('certifications')}
              className="w-full border-b border-zinc-800 py-5.5 px-6 sm:px-8 flex justify-between items-center text-left text-white hover:bg-zinc-900/40 transition-colors focus:outline-none"
              aria-expanded={activeAccordion === 'certifications'}
            >
              <span className="text-xs sm:text-sm uppercase tracking-widest font-mono text-zinc-300">
                Certifications &amp; Achievements
              </span>
              {activeAccordion === 'certifications' ? (
                <Minus className="h-4 w-4 text-zinc-400" />
              ) : (
                <Plus className="h-4 w-4 text-zinc-400" />
              )}
            </button>
            <div
              ref={certsContentRef}
              className="overflow-hidden bg-zinc-950/80"
              style={{ height: 0, opacity: 0 }}
            >
              <div className="px-6 sm:px-8 py-5 text-zinc-400 text-xs sm:text-sm leading-relaxed space-y-2.5 font-mono border-b border-zinc-800">
                {landingData.certifications?.map((cert, index) => (
                  <p key={index} className="cert-item flex items-start gap-2 opacity-0">
                    <span className="text-zinc-500 font-mono">&#91;{String(index + 1).padStart(2, '0')}&#93;</span>
                    <span><strong>{cert}</strong></span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="w-full">
            <button
              onClick={() => toggleAccordion('skills')}
              className="w-full border-b border-zinc-800 py-5.5 px-6 sm:px-8 flex justify-between items-center text-left text-white hover:bg-zinc-900/40 transition-colors focus:outline-none"
              aria-expanded={activeAccordion === 'skills'}
            >
              <span className="text-xs sm:text-sm uppercase tracking-widest font-mono text-zinc-300">
                Core Skills
              </span>
              {activeAccordion === 'skills' ? (
                <Minus className="h-4 w-4 text-zinc-400" />
              ) : (
                <Plus className="h-4 w-4 text-zinc-400" />
              )}
            </button>
            <div
              ref={skillsContentRef}
              className="overflow-hidden bg-zinc-950/80"
              style={{ height: 0, opacity: 0 }}
            >
              <div className="px-6 sm:px-8 py-5 text-zinc-400 text-xs sm:text-sm leading-relaxed font-mono border-b border-zinc-800">
                <div className="flex flex-wrap gap-2">
                  {landingData.skills?.map((tech) => (
                    <span
                      key={tech}
                      className="skill-badge px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-sm opacity-0 inline-block"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div
        ref={rightColRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="w-full md:w-3/5 bg-black text-white px-6 py-10 sm:px-10 sm:py-12 md:py-20 md:px-16 flex flex-col justify-between min-h-screen md:min-h-0 relative transition-all duration-300"
        style={{
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.045), transparent 85%)`,
          backgroundColor: '#000000',
        }}
      >
        {/* Editorial copy */}
        <div className="hero-right-fade-stagger opacity-0 my-auto flex flex-col space-y-6 sm:space-y-8 max-w-xl text-right items-end ml-auto w-full py-8 md:py-12 relative z-10">
          <h2
            ref={textRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-garamond text-white font-medium tracking-tight mb-2 sm:mb-4 hover:tracking-wide transition-all duration-700 select-none cursor-default"
          >
            {landingData.heroName}
          </h2>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-garamond text-zinc-400 leading-[1.25] font-light tracking-tight hover:text-zinc-200 transition-colors duration-500 select-none cursor-default">
            {landingData.heroSubtitle}
          </h1>
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono select-none cursor-default">
            {landingData.heroLocation}
          </div>
        </div>

        {/* Action buttons */}
        <div className="hero-right-fade-stagger opacity-0 flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 justify-end w-full pb-8 md:pb-12 relative z-10">
          <button
            onClick={scrollToProjects}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors border-b border-zinc-800 hover:border-white pb-1 font-mono cursor-pointer group"
          >
            <span>View My Work</span>
            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>
          <button
            onClick={downloadCV}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors border-b border-zinc-800 hover:border-white pb-1 font-mono cursor-pointer group"
          >
            <span>Download CV</span>
            <Download className="h-3 w-3 group-hover:translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Full-screen nav overlay */}
      <NavMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuData={menuData}
        onNavClick={handleNavClick}
      />

    </section>
  );
};

export default Hero;