import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Code2 } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/projects', label: 'Projects' },
  ]

  const isActive = (href: string) => location.pathname === href

  // Add scroll to top or redirect logic for logo
  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // else, let Link handle navigation
    setIsOpen(false);
  };

  // Add scroll to top or redirect logic for nav links
  const handleNavLinkClick = (e: React.MouseEvent, href: string) => {
    if (location.pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsOpen(false);
    }
    // else, let Link handle navigation
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container-width section-padding">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" onClick={handleLogoClick}>
            <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Code2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <span className="text-lg md:text-xl font-bold heading-gradient hidden sm:block">Ashikul Bari Chowdhury</span>
            <span className="text-lg md:text-xl font-bold heading-gradient sm:hidden">Ashikul Bari</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleNavLinkClick(e, item.href)}
                className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-gray-300'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
            <a
              href="mailto:ashikul.chowdhury@proton.me"
              className="btn-primary-small"
              onClick={() => setIsOpen(false)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Get In Touch</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Menu className="h-5 w-5 md:h-6 md:w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 glass-effect rounded-lg">
            <div className="flex flex-col space-y-2 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={(e) => handleNavLinkClick(e, item.href)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-white/10 ${
                    isActive(item.href) ? 'text-primary bg-white/5' : 'text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="mailto:ashikul.chowdhury@proton.me"
                className="btn-primary-small mt-4 text-center"
                onClick={() => setIsOpen(false)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Get In Touch</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation