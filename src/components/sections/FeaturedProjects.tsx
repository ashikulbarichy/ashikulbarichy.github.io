import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, ExternalLink, ArrowRight } from 'lucide-react';
import { getFeaturedProjects } from '../../lib/mock-data';
import type { Project } from '../../types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InteractiveCanvas from '../InteractiveCanvas';
import GrainOverlay from '../ui/GrainOverlay';
import ProjectTiltCard from './ProjectTiltCard';
import { useDataRefresh } from '../../hooks/useDataRefresh';

gsap.registerPlugin(ScrollTrigger);

const FeaturedProjects = () => {
  const navigate  = useNavigate();
  const refreshKey = useDataRefresh();

  const [projects,    setProjects]    = useState<Project[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef    = useRef<HTMLDivElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    getFeaturedProjects().then((res) => {
      if (alive) {
        setProjects(res);
        setIsLoading(false);
      }
    });
    return () => { alive = false; };
  }, [refreshKey]);

  // ── ScrollTrigger carousel ─────────────────────────────────────────────────
  useEffect(() => {
    if (projects.length === 0 || !containerRef.current) return;

    const n = projects.length;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: stickyRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            const newIdx = Math.min(n - 1, Math.floor(self.progress * n));
            setActiveIndex((prev) => (prev !== newIdx ? newIdx : prev));
          },
        },
      });

      tl.to({}, { duration: 1.0 });

      for (let i = 0; i < n - 1; i++) {
        const at       = (i + 0.5) / n;
        const duration = 0.5 / n;

        tl.to(`.project-card-${i}`,    { opacity: 0, y: -60, ease: 'power2.inOut', duration }, at)
          .to(`.project-details-${i}`, { opacity: 0, y: -30, ease: 'power2.inOut', duration }, at)
          .to(`.project-glow-${i}`,    { opacity: 0,          ease: 'power2.inOut', duration }, at)
          .to(`.project-num-${i}`,     { opacity: 0, y: -50,  ease: 'power2.inOut', duration }, at);

        tl.fromTo(`.project-card-${i + 1}`,
            { opacity: 0, y: 60 },  { opacity: 1, y: 0, ease: 'power2.inOut', duration }, at)
          .fromTo(`.project-details-${i + 1}`,
            { opacity: 0, y: 30 },  { opacity: 1, y: 0, ease: 'power2.inOut', duration }, at)
          .fromTo(`.project-glow-${i + 1}`,
            { opacity: 0 },         { opacity: 1,        ease: 'power2.inOut', duration }, at)
          .fromTo(`.project-num-${i + 1}`,
            { opacity: 0, y: 50 },  { opacity: 0.35, y: 0, ease: 'power2.inOut', duration }, at);
      }

      // Entrance animation for the first slide
      gsap.fromTo('.project-card-0',    { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.project-details-0', { opacity: 0, y: 15 },               { opacity: 1, y: 0,           duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.project-glow-0',    { opacity: 0 },                       { opacity: 1,                 duration: 1.2, ease: 'power2.out' });
      gsap.fromTo('.project-num-0',     { opacity: 0, y: 25 },               { opacity: 0.35, y: 0,        duration: 1.2, ease: 'power2.out' });

      // Hide every slide except the first one so they don't flash before their transition
      if (n > 1) {
        const rest = Array.from({ length: n - 1 }, (_, i) => i + 1);
        gsap.set(rest.map((i) => `.project-card-${i}`).join(', '),    { opacity: 0, y: 60 });
        gsap.set(rest.map((i) => `.project-details-${i}`).join(', '), { opacity: 0, y: 30 });
        gsap.set(rest.map((i) => `.project-glow-${i}`).join(', '),    { opacity: 0 });
        gsap.set(rest.map((i) => `.project-num-${i}`).join(', '),     { opacity: 0, y: 50 });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [projects]);

  if (isLoading) {
    return (
      <section id="featured-projects" className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Loading Projects...</p>
        </div>
      </section>
    );
  }

  const n = projects.length;
  const sectionHeightVh = (n + 1) * 100;

  return (
    <section
      ref={containerRef}
      id="featured-projects"
      className="relative bg-black text-white w-full border-t border-zinc-900 overflow-visible"
      style={{ height: `${sectionHeightVh}vh` }}
    >
      <div ref={stickyRef} className="sticky top-0 w-full h-screen flex flex-col md:flex-row overflow-hidden">

        {/* LEFT COLUMN: Project tilt card */}
        <div className="w-full md:w-[60%] h-[40vh] md:h-full relative overflow-hidden bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-900 z-20 flex items-center justify-center p-4 md:p-8">
          <InteractiveCanvas particlesCount={60} />
          <GrainOverlay opacity="opacity-[0.0225]" />

          {/* Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none select-none opacity-40 mix-blend-overlay"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px',
              backgroundPosition: 'center center',
            }}
          />

          {/* Radial Spotlights */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {projects.map((_, index) => (
              <div
                key={index}
                className={`project-glow-${index} absolute -inset-[20%] opacity-0 rounded-full blur-[140px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_60%)]`}
              />
            ))}
          </div>

          {/* Slide numbers */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            {projects.map((_, index) => (
              <div
                key={index}
                className={`project-num-${index} absolute font-garamond font-bold text-[18rem] md:text-[24rem] select-none pointer-events-none`}
                style={{
                  opacity: 0,
                  transform: 'translateY(50px)',
                  WebkitTextStroke: '1px rgba(255, 255, 255, 0.04)',
                  color: 'transparent',
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Stacked polaroid cards */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`project-card-${index} absolute inset-0 flex items-center justify-center ${index === activeIndex ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                <ProjectTiltCard
                  image={project.image}
                  title={project.title}
                  category={project.category}
                  date={project.date}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Info panel */}
        <div className="w-full md:w-[40%] h-[60vh] md:h-full relative flex flex-col justify-between p-6 sm:p-10 md:p-16 bg-black z-10 text-right items-end">

          {/* Counter */}
          <div className="flex w-full justify-between items-center pb-4 border-b border-zinc-900/50 flex-none">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">[ Featured Projects ]</span>
            <span className="font-garamond font-bold text-2xl text-zinc-400 select-none">{activeIndex + 1}/{n}</span>
          </div>

          {/* Detail panels */}
          <div className="w-full max-w-xl flex-1 relative my-auto md:min-h-[400px] min-h-[300px] flex items-center">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`project-details-${index} absolute inset-x-0 flex flex-col space-y-6 items-end text-right ${index === activeIndex ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                {/* Title */}
                <div className="h-[110px] w-full flex items-end justify-end border-b border-zinc-900 pb-4">
                  <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-garamond font-medium tracking-tight leading-tight text-white max-w-lg">
                    {project.title}
                  </h2>
                </div>

                {/* Tech Stack */}
                <div className="h-[65px] w-full flex flex-col justify-between items-end">
                  <span className="text-zinc-500 text-[8px] sm:text-[9px] uppercase tracking-widest font-mono block">Tech Stack</span>
                  <div className="flex flex-nowrap gap-1.5 justify-end items-center" style={{ flexWrap: 'nowrap' }}>
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="active-project-tag px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[9px] sm:text-xs font-mono rounded-sm inline-flex items-center justify-center"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Overview */}
                <div className="h-[120px] w-full flex flex-col justify-between items-end">
                  <span className="text-zinc-500 text-[8px] sm:text-[9px] uppercase tracking-widest font-mono block">Overview</span>
                  <p className="text-zinc-400 text-xs sm:text-sm font-mono leading-relaxed max-w-lg ml-auto">
                    {project.description}
                  </p>
                </div>

                {/* Links */}
                <div className="h-[40px] flex gap-4 sm:gap-6 items-center justify-end w-full">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border-b border-zinc-800 hover:border-white pb-0.5 font-mono group"
                  >
                    <span>GitHub Code</span>
                    <Github className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </a>
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border-b border-zinc-800 hover:border-white pb-0.5 font-mono group"
                    >
                      <span>Live Site</span>
                      <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* View all */}
          <div className="w-full flex justify-end pt-4 border-t border-zinc-900/50 flex-none">
            <button
              onClick={() => navigate('/projects')}
              className="group flex items-baseline gap-1.5 cursor-pointer text-right justify-end"
            >
              <span className="font-mono text-xs text-zinc-500 group-hover:text-white transition-colors border-b border-zinc-800 group-hover:border-white pb-0.5 tracking-wider uppercase">
                More Selected Works
              </span>
              <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;