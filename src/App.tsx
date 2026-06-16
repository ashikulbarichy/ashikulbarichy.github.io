import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import NotFound from './pages/NotFound'
import { SmoothScroll } from './components/SmoothScroll'
import LoadingScreen from './components/LoadingScreen'
import { gsap } from 'gsap'
import 'lenis/dist/lenis.css'

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(() => {
    // Check if the user is visiting the link for the first time in this session.
    // sessionStorage persists through page reloads/refreshes in the same tab,
    // so we only show the loading screen on the very first load.
    if (typeof window !== 'undefined') {
      const visited = sessionStorage.getItem('portfolio_visited');
      return !visited;
    }
    return true;
  });
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      sessionStorage.setItem('portfolio_visited', 'true');
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && mainContentRef.current) {
      gsap.fromTo(mainContentRef.current,
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: 'power3.out',
          clearProps: 'all'
        }
      );
    }
  }, [isLoading]);

  return (
    <>
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}
      <SmoothScroll>
        <div 
          className="bg-background text-foreground antialiased relative min-h-screen"
        >
          <div className="relative z-10">
            <main 
              ref={mainContentRef}
              className="min-h-screen main-content overflow-hidden"
              style={{ opacity: isLoading ? 0 : 1 }}
            >
              <div key={location.pathname} className="page-transition">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>

          </div>
        </div>
      </SmoothScroll>
    </>
  )
}

export default App