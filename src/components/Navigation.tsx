import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Code2, Menu, X } from 'lucide-react'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      
              // Update active section based on scroll position
        if (location.pathname === '/') {
          const sections = ['#about', '#skills', '#featured-projects', '#journey', '#contact']
          const scrollPosition = window.scrollY + 100

        for (const section of sections) {
          const element = document.querySelector(section) as HTMLElement
          if (element) {
            const rect = element.getBoundingClientRect()
            const offsetTop = element.offsetTop
            
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + rect.height) {
              setActiveSection(section)
              break
            }
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  const navItems = [
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#featured-projects', label: 'Projects' },
    { href: '#journey', label: 'Journey' },
    { href: '#contact', label: 'Contact' },
  ]

  const isActive = (href: string) => {
    if (href.startsWith('#')) {
      return location.pathname === '/' && activeSection === href;
    }
    return location.pathname === href;
  }

  // Add scroll to top or redirect logic for logo
  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add scroll to top or redirect logic for nav links
  const handleNavLinkClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (location.pathname === '/') {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // If not on home page, navigate to home and then scroll
        window.location.href = `/${href}`;
      }
    } else if (location.pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-3 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none px-3 sm:px-4">
      <div className={`pointer-events-auto flex items-center justify-between px-2.5 sm:px-3 py-1 rounded-full glass-effect shadow-xl border border-white/10 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'shadow-2xl' : ''} max-w-lg sm:max-w-xl w-full`}>
        {/* Logo + Name - Left Side */}
        <Link to="/" className="flex items-center space-x-1.5 group" onClick={handleLogoClick}>
          <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600 text-white shadow-md">
            <Code2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-xs tracking-wide leading-tight">Ashikul Bari</span>
            <span className="text-gray-300 text-xs tracking-wide leading-tight hidden sm:block">Chowdhury</span>
          </div>
        </Link>
        {/* Navigation Tabs - Right Side */}
        <div className="hidden sm:flex items-center space-x-1">
          {location.pathname === '/projects' ? (
            <Link
              to="/"
              className="px-3 py-1 rounded-full font-medium text-xs transition-all duration-200 text-white hover:text-purple-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Home
            </Link>
          ) : (
            navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleNavLinkClick(e, item.href)}
                className={`px-1.5 sm:px-2 py-0.5 rounded-full font-medium text-xs transition-all duration-200 hover:text-purple-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  isActive(item.href)
                    ? 'bg-purple-700/80 text-purple-200 shadow-md'
                    : 'text-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))
          )}
        </div>
        {/* Hamburger for mobile */}
        <button
          className="sm:hidden flex items-center justify-center p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-12 left-0 w-full bg-background/95 rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center py-4 z-50 sm:hidden animate-fade-in-up">
            {location.pathname === '/projects' ? (
              <Link
                to="/"
                className="px-4 py-2 rounded-full font-medium text-base text-white hover:text-purple-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            ) : (
              navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={(e) => { handleNavLinkClick(e, item.href); setMobileMenuOpen(false); }}
                  className={`px-4 py-2 rounded-full font-medium text-base transition-all duration-200 hover:text-purple-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2 ${
                    isActive(item.href)
                      ? 'bg-purple-700/80 text-purple-200 shadow-md'
                      : 'text-gray-200'
                  }`}
                >
                  {item.label}
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation