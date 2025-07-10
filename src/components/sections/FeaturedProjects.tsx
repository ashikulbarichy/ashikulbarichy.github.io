import { useState, useEffect } from 'react'
import { ExternalLink, Github, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getProjects, Project } from '../../lib/mock-data'

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-4 md:mb-6">
            <div className="w-8 md:w-12 h-0.5 bg-primary" />
            <span className="text-primary font-medium text-sm md:text-base">My Work</span>
            <div className="w-8 md:w-12 h-0.5 bg-primary" />
          </div>
          <h2 className="text-section-title font-bold heading-gradient mb-4 md:mb-6">
            Featured Projects
          </h2>
        </div>

        <div className="max-w-2xl mx-auto mb-8 md:mb-12">
          {projects.map((project) => (
            <article key={project.id} className="glass-effect rounded-2xl overflow-hidden hover-lift group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-primary/20 backdrop-blur-sm text-primary text-sm font-medium rounded-full">
                    {project.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                    aria-label={`View ${project.title} source code on GitHub`}
                  >
                    <Github className="h-4 w-4 text-white" />
                  </a>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                    aria-label={`View ${project.title} live demo`}
                  >
                    <ExternalLink className="h-4 w-4 text-white" />
                  </a>
                </div>
                
                {/* Project Meta Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-sm text-white/90">
                    <span>{project.date}</span>
                    <span className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs">
                      Case Study
                    </span>
                    <span>{project.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="text-white text-sm font-medium mb-3">Complete Tech Stack:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-400/30 text-blue-300 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h4 className="text-white text-sm font-medium mb-3">Key Features & Capabilities:</h4>
                  <ul className="space-y-1">
                    {project.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-xs text-gray-400 flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/projects"
            className="inline-flex items-center space-x-2 px-6 py-3 md:px-8 md:py-4 glass-effect text-white rounded-full font-medium hover:bg-white/10 transition-colors group"
            aria-label="Browse all development projects and portfolio"
          >
            <span>Browse All Projects</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProjects