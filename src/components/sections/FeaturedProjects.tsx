import { useState, useEffect } from 'react'
import { Github, ArrowRight, Briefcase } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getProjects, Project } from '../../lib/mock-data'

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();

  const handleBrowseAllProjects = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/projects');
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      const { projects: featuredProjects } = getProjects({ limit: 1 })
      setProjects(featuredProjects)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <section id="featured-projects" className="content-spacing bg-black/20 section-container">
        <div className="container-width section-padding">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading projects...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="featured-projects" className="content-spacing bg-black/20 section-container">
      <div className="container-width section-padding">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-4 md:mb-6">
            <div className="w-6 sm:w-8 md:w-12 h-0.5 bg-primary" />
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
              <span className="text-primary font-medium text-sm md:text-base">My Work</span>
            </div>
            <div className="w-6 sm:w-8 md:w-12 h-0.5 bg-primary" />
          </div>
          <h2 className="text-section-title font-bold heading-gradient mb-4 md:mb-6">
            Featured Projects
          </h2>
        </div>

        <div className="max-w-3xl mx-auto mb-8 md:mb-14 px-4">
          {projects.map((project) => (
            <article key={project.id} className="relative flex flex-col md:flex-row glass-effect rounded-3xl overflow-hidden shadow-2xl border border-fuchsia-500/20 group hover:shadow-fuchsia-500/30 transition-shadow duration-300">
              {/* Image Section */}
              <div className="relative md:w-1/2 h-56 md:h-auto overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-3 py-1 bg-fuchsia-600/80 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-md border border-fuchsia-300/40">
                  {project.category}
                </span>
                {project.isLive && (
                  <span className="absolute top-11 left-4 flex items-center gap-2 text-xs font-semibold text-white px-3 py-1 bg-green-700/80 rounded-full shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-md" style={{ boxShadow: '0 0 8px 2px #22c55e88' }}></span>
                    Live
                  </span>
                )}
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-black/40 hover:bg-fuchsia-600/80 border border-fuchsia-300/40 rounded-full shadow-lg backdrop-blur-md transition-colors"
                    aria-label={`View ${project.title} source code on GitHub`}
                  >
                    <Github className="h-5 w-5 text-white" />
                  </a>
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-black/40 hover:bg-green-600/80 border border-green-300/40 rounded-full shadow-lg backdrop-blur-md transition-colors"
                      aria-label={`View ${project.title} live project`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H19.5V12M19.5 6L10.5 15M4.5 18.75V19.5A2.25 2.25 0 006.75 21.75H17.25A2.25 2.25 0 0019.5 19.5V8.25A2.25 2.25 0 0017.25 6H16.5" />
                      </svg>
                    </a>
                  )}
                </div>
                {/* Meta Bar */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80 bg-black/40 rounded-xl px-4 py-2 backdrop-blur-md border border-fuchsia-300/20 shadow-md">
                  <span>{project.date}</span>
                  <span className="px-2 py-1 bg-fuchsia-600/60 rounded-full text-xs font-semibold capitalize">
                    {project.type === 'case-study' ? 'Case Study' : project.type === 'research' ? 'Research' : 'Application'}
                  </span>
                  <span>{project.duration}</span>
                </div>
              </div>
              {/* Content Section */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center space-y-5 bg-gradient-to-br from-[#231942]/80 to-[#2d2154]/90">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight leading-tight">
                  {project.title}
                </h3>
                {/* Why I built this? */}
                <div className="mb-2 flex flex-row">
                  <div className="w-2 rounded-l-xl bg-fuchsia-500/80" />
                  <div className="flex-1 pl-4 py-1">
                    <h4 className="text-fuchsia-400 text-sm font-medium mb-1">Why I built this?</h4>
                    <p className="text-gray-200 text-sm leading-relaxed font-normal">
                      {project.description || 'This project was built to solve a real-world problem, demonstrate my skills, and deliver value to users or clients.'}
                    </p>
                  </div>
                </div>
                {/* Tech Stack */}
                <div>
                  <h4 className="text-white text-xs font-medium mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-gradient-to-r from-purple-700/40 to-fuchsia-700/40 border border-fuchsia-400/30 text-white text-xs rounded-full font-medium shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Key Features */}
                <div>
                  <h4 className="text-white text-xs font-medium mb-2">Key Features</h4>
                  <ul className="space-y-1.5">
                    {project.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm text-gray-300 font-normal">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-fuchsia-400 block flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center px-4">
          <Link
            to="/projects"
            onClick={handleBrowseAllProjects}
            className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 md:px-8 md:py-4 glass-effect text-white rounded-full font-medium hover:bg-white/10 transition-colors group"
            aria-label="Browse all development projects and portfolio"
          >
            <span>Browse All Projects</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProjects