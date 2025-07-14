import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Download, ExternalLink, Sparkles, Code2, Zap, Star, Heart } from 'lucide-react';

// Floating icon data
const floatingIcons = [
  { icon: Code2, color: 'text-purple-400/20', size: 40 },
  { icon: Zap, color: 'text-fuchsia-400/20', size: 40 },
  { icon: Star, color: 'text-purple-300/20', size: 40 },
  { icon: Heart, color: 'text-fuchsia-300/20', size: 40 },
  { icon: Sparkles, color: 'text-purple-400/15', size: 40 },
  { icon: Code2, color: 'text-fuchsia-400/20', size: 40 },
  { icon: Zap, color: 'text-purple-300/15', size: 36 },
  { icon: Star, color: 'text-fuchsia-300/20', size: 36 },
];

type IconState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const ICON_RADIUS = 24; // px, for collision
const CONTAINER_PADDING = 20; // px, to avoid sticking to edges

function getRandom(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

type FloatingIconProps = {
  Icon: React.ElementType;
  x: number;
  y: number;
  color: string;
  size: number;
};

const FloatingIcon = ({ Icon, x, y, color, size }: FloatingIconProps) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      pointerEvents: 'none',
      zIndex: 1,
      transition: 'none',
    }}
    className={color}
  >
    <Icon style={{ width: size, height: size }} />
  </div>
);

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement | null>(null)
  // Interactive gradient state
  const [gradientPos, setGradientPos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [iconStates, setIconStates] = useState<IconState[]>([]);

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      () => {
        // No-op, removed unused entry
      },
      { threshold: 0.2 }
    )
    if (heroRef.current) {
      observer.observe(heroRef.current)
    }
    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current)
    }
  }, [])

  // Mouse move handler for interactive gradient
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGradientPos({ x, y });
  };

  // Initialize icon positions and velocities
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const initialStates: IconState[] = floatingIcons.map(() => ({
      x: getRandom(CONTAINER_PADDING, width - CONTAINER_PADDING - ICON_RADIUS * 2),
      y: getRandom(CONTAINER_PADDING, height - CONTAINER_PADDING - ICON_RADIUS * 2),
      vx: getRandom(-0.7, 0.7),
      vy: getRandom(-0.7, 0.7),
    }));
    setIconStates(initialStates);
    // eslint-disable-next-line
  }, []);

  // Animation loop for movement and collision
  useEffect(() => {
    let animationId: number;
    function animate() {
      setIconStates((prev: IconState[]) => {
        if (!containerRef.current) return prev;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        let next = prev.map((icon) => {
          let { x, y, vx, vy } = icon;
          x += vx;
          y += vy;
          // Bounce off edges
          if (x < CONTAINER_PADDING) { x = CONTAINER_PADDING; vx = -vx; }
          if (y < CONTAINER_PADDING) { y = CONTAINER_PADDING; vy = -vy; }
          if (x > width - ICON_RADIUS * 2 - CONTAINER_PADDING) { x = width - ICON_RADIUS * 2 - CONTAINER_PADDING; vx = -vx; }
          if (y > height - ICON_RADIUS * 2 - CONTAINER_PADDING) { y = height - ICON_RADIUS * 2 - CONTAINER_PADDING; vy = -vy; }
          return { x, y, vx, vy };
        });
        // Collision detection and response
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[i].x - next[j].x;
            const dy = next[i].y - next[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ICON_RADIUS * 2) {
              // Simple elastic collision: swap velocities
              const tempVx = next[i].vx;
              const tempVy = next[i].vy;
              next[i].vx = next[j].vx;
              next[i].vy = next[j].vy;
              next[j].vx = tempVx;
              next[j].vy = tempVy;
              // Move them apart
              const overlap = ICON_RADIUS * 2 - dist;
              const angle = Math.atan2(dy, dx);
              next[i].x += Math.cos(angle) * (overlap / 2);
              next[i].y += Math.sin(angle) * (overlap / 2);
              next[j].x -= Math.cos(angle) * (overlap / 2);
              next[j].y -= Math.sin(angle) * (overlap / 2);
            }
          }
        }
        return next;
      });
      animationId = requestAnimationFrame(animate);
    }
    if (iconStates.length === floatingIcons.length) {
      animationId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationId);
    // eslint-disable-next-line
  }, [iconStates.length]);

  const scrollToProjects = () => {
    const projectsSection = document.querySelector('#featured-projects')
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const downloadCV = () => {
    const link = document.createElement('a')
    link.href = 'https://www.dropbox.com/scl/fi/mi6xs19gw2xd7axkzsrxn/ashikul-bari-cv.pdf?rlkey=0l4xas6blt87hsbujvwl1ggkg&st=mc03tqr4&dl=1'
    link.download = '/ashikul-bari-cv.pdf'
    link.click()
  }

  // Removed unused handleGetInTouch function

  return (
    <section
      ref={heroRef}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden section-container"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Gradient Element */}
      <div
        className="pointer-events-none select-none absolute inset-0 z-0 transition-all duration-300"
        style={{
          background: `radial-gradient(600px at ${gradientPos.x}% ${gradientPos.y}%, rgba(139,92,246,0.25) 0%, rgba(168,85,247,0.18) 50%, transparent 100%)`,
        }}
        aria-hidden="true"
      />
      {/* Floating Icons with Collision Detection */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {iconStates.length === floatingIcons.length &&
          iconStates.map((state, i) => (
            <FloatingIcon
              key={i}
              Icon={floatingIcons[i].icon}
              x={state.x}
              y={state.y}
              color={floatingIcons[i].color}
              size={floatingIcons[i].size}
            />
          ))}
      </div>
      
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none select-none z-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-r from-fuchsia-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-80 sm:h-80 md:w-[600px] md:h-[600px] bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 rounded-full blur-3xl animate-float" />
      </div>

      <div className="container-width section-padding content-spacing flex flex-col items-center justify-center relative z-10">
        <div className={`w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center space-y-3 sm:space-y-6 md:space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}> 
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-2 sm:mb-4">
            <div className="w-6 sm:w-8 md:w-16 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
            <div className="flex items-center space-x-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-400 animate-pulse" />
              <span className="text-purple-300 font-medium text-xs sm:text-sm md:text-lg">Hello, I'm</span>
            </div>
            <div className="w-6 sm:w-8 md:w-16 h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
          </div>
          {/* Highlighted Name */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-2 sm:mb-4 text-center">
            <span className="text-pink-400 drop-shadow-lg" style={{fontSize: 'clamp(1.5rem,6vw,5rem)'}}>
              Ashikul Bari Chowdhury
            </span>
          </h1>
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4 text-white tracking-wide drop-shadow-sm text-center">
            ASP.NET Developer & Project Manager
          </h2>
          <div className="flex justify-center items-center mt-2 sm:mt-4 mb-2 sm:mb-4">
            <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md border border-purple-400/20 text-purple-200 font-medium text-xs sm:text-sm animate-fade-in-up">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0c-3.866 0-7 1.79-7 4v2h14v-2c0-2.21-3.134-4-7-4z" />
              </svg>
              <span>Dhaka, Bangladesh</span>
            </span>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mt-2 mb-6 sm:mb-10 text-center px-4">
            Fresh ASP.NET developer building scalable solutions using EF Core while integrating core values to the team for goal based delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center mb-20 sm:mb-32 px-4">
            <button 
              onClick={scrollToProjects}
              className="btn-primary btn-interactive group w-full sm:w-auto"
              aria-label="View my development projects and portfolio"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>View My Work</span>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </span>
            </button>
            <button 
              onClick={downloadCV}
              className="btn-secondary btn-interactive group w-full sm:w-auto"
              aria-label="Download Ashikul Bari Chowdhury's CV/Resume"
            >
              <span className="flex items-center justify-center space-x-2">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:translate-y-1 transition-transform duration-300" />
                <span>Download CV</span>
              </span>
            </button>
          </div>
          {/* Enhanced Scroll Indicator - now relative to hero section, not fixed to viewport */}
          <div className="w-full flex flex-col items-center justify-center mt-20 sm:mt-40 animate-bounce">
            <span className="text-xs md:text-sm font-medium text-slate-400">Scroll to explore</span>
            <div className="p-2 md:p-3 rounded-full border border-purple-400/30 bg-purple-900/20 backdrop-blur-sm mt-2">
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero