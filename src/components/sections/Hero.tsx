import { useState, useEffect } from 'react'
import { ChevronDown, Download, ExternalLink, Sparkles } from 'lucide-react'

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToProjects = () => {
    const projectsSection = document.querySelector('#featured-projects')
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const downloadCV = () => {
    // Create a link to download CV
    const link = document.createElement('a')
    link.href = '/' // You can replace this with actual CV file
    link.download = ''
    link.click()
  }

  // Removed unused handleGetInTouch function

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden section-container">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[600px] md:h-[600px] bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl animate-float" />
      </div>

      <div className="container-width section-padding content-spacing">
        <div className="grid-responsive-2 gap-responsive items-center">
          {/* Left Content */}
          <div className={`space-y-6 md:space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 md:w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-blue-400 animate-pulse" />
                  <span className="text-blue-300 font-medium text-sm md:text-lg">Hello, I'm Ashikul Bari Chowdhury</span>
                </div>
              </div>
              
              <h1 className="text-hero font-bold leading-tight">
                <span className="heading-gradient">Full Stack</span>
                <br />
                <span className="text-white">Developer &</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Project Manager</span>
              </h1>
              
              <p className="text-base md:text-xl text-slate-300 max-w-2xl leading-relaxed">
                I craft exceptional digital experiences through code and leadership. 
                Specializing in <strong>React</strong>, <strong>Angular</strong>, <strong>ASP.NET</strong>, and <strong>Python</strong> development with 
                <strong> 5+ years of experience</strong> leading teams and delivering scalable solutions 
                that drive business growth and innovation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <button 
                onClick={scrollToProjects}
                className="btn-primary btn-interactive group w-full sm:w-auto"
                aria-label="View my development projects and portfolio"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>View My Work</span>
                  <ExternalLink className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </span>
              </button>
              
              <button 
                onClick={downloadCV}
                className="btn-secondary btn-interactive group w-full sm:w-auto"
                aria-label="Download Ashikul Bari Chowdhury's CV/Resume"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-y-1 transition-transform duration-300" />
                  <span>Download CV</span>
                </span>
              </button>
              
              <a
                href="mailto:ashikul.chowdhury@proton.me"
                className="btn-tertiary btn-interactive group w-full sm:w-auto flex items-center justify-center"
                aria-label="Get in touch with Ashikul Bari Chowdhury via email"
                style={{ textDecoration: 'none' }}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Get in Touch</span>
                </span>
              </a>
            </div>
          </div>

          {/* Right Content - Enhanced Profile Image */}
          <div className={`relative order-first lg:order-last ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            <div className="relative w-full max-w-sm md:max-w-lg mx-auto">
              {/* Enhanced Decorative Elements */}
              <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-48 h-48 md:w-80 md:h-80 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-full blur-2xl animate-pulse-glow" />
              <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 w-48 h-48 md:w-80 md:h-80 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
              
              {/* Profile Image Container */}
              <div className="relative card-trusted rounded-2xl md:rounded-3xl p-4 md:p-8 hover-lift">
                <div className="relative w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-400/20">
                  <img
                    src="https://miro.medium.com/v2/resize:fit:800/0*hfcOIGR7ni8uoJZQ.jpg"
                    alt="Ashikul Bari Chowdhury - Full Stack Developer & Project Manager specializing in React, Angular, ASP.NET"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
                </div>
                
                {/* Enhanced Floating Badge */}
                <div className="absolute -bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2 card-trusted px-4 py-2 md:px-8 md:py-4 rounded-full animate-float">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs md:text-sm font-semibold text-white">Available for hire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center space-y-2 md:space-y-3 text-slate-400">
            <span className="text-xs md:text-sm font-medium">Scroll to explore</span>
            <div className="p-2 md:p-3 rounded-full border border-blue-400/30 bg-blue-900/20 backdrop-blur-sm">
              <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero