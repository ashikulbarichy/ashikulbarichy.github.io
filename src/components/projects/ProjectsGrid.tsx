import { useState, useEffect } from 'react'
import { Github, Search } from 'lucide-react'
import { getProjects, Project } from '../../lib/mock-data'

interface ProjectsGridProps {
  selectedCategory?: string
}

const ProjectsGrid = ({ selectedCategory = 'all' }: ProjectsGridProps) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProjects()
  }, [selectedCategory, searchTerm])

  const loadProjects = async () => {
    setIsLoading(true)
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const { projects: filteredProjects } = getProjects({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchTerm
    })
    
    setProjects(filteredProjects)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <section className="py-20">
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
    <section className="py-10 sm:py-16 md:py-20">
      <div className="container-width section-padding">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 md:gap-10">
          {projects.map((project) => (
            <article key={project.id} className="relative glass-effect rounded-3xl overflow-hidden shadow-2xl border border-fuchsia-500/20 group hover:shadow-fuchsia-500/30 transition-shadow duration-300 bg-gradient-to-br from-[#231942]/80 to-[#2d2154]/90">
              {/* Image Section */}
              <div className="relative h-40 sm:h-56 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                {/* Category Badge and Live Badge */}
                <div className="absolute top-4 left-4 flex flex-row items-center gap-2 z-10">
                  <span className="px-3 py-1 bg-fuchsia-600/80 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-md border border-fuchsia-300/40">
                    {project.category}
                  </span>
                  {project.isLive && (
                    <span className="flex items-center gap-2 text-xs font-semibold text-white px-3 py-1 bg-green-700/80 rounded-full shadow-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-md" style={{ boxShadow: '0 0 8px 2px #22c55e88' }}></span>
                      Live
                    </span>
                  )}
                </div>
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-black/40 hover:bg-fuchsia-600/80 border border-fuchsia-300/40 rounded-full shadow-lg backdrop-blur-md transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="h-5 w-5 text-white" />
                    </a>
                  )}
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-black/40 hover:bg-green-600/80 border border-green-300/40 rounded-full shadow-lg backdrop-blur-md transition-colors"
                      onClick={(e) => e.stopPropagation()}
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
                  <div className="flex items-center space-x-3">
                    <span>{project.date}</span>
                    <span className="px-2 py-1 bg-fuchsia-600/60 rounded-full text-xs font-semibold capitalize">
                      {project.type === 'case-study' ? 'Case Study' : project.type === 'research' ? 'Research' : 'Application'}
                    </span>
                  </div>
                  <span>{project.duration}</span>
                </div>
              </div>
              {/* Content Section */}
              <div className="p-4 sm:p-6 md:p-7 flex flex-col space-y-4 sm:space-y-5">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight leading-tight">
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

        {/* No Results */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
              <p>
                {searchTerm 
                  ? `No projects match "${searchTerm}". Try adjusting your search.`
                  : selectedCategory !== 'all' 
                    ? `No projects found in the "${selectedCategory}" category.`
                    : 'No projects available.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectsGrid