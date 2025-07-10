import { useState, useEffect } from 'react'
import { ExternalLink, Github, Calendar, Users, Search } from 'lucide-react'
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
    <section className="py-20">
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
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <article key={project.id} className="glass-effect rounded-2xl overflow-hidden hover-lift group">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-primary/20 backdrop-blur-sm text-primary text-xs font-medium rounded-full">
                    {project.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="h-4 w-4 text-white" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4 text-white" />
                    </a>
                  )}
                </div>

                {/* Project Meta Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-xs text-white/90">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{project.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{project.team}</span>
                      </div>
                    </div>
                    <span className="text-primary font-medium">{project.duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{project.description}</p>
                </div>

                {/* Complete Tech Stack */}
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

                {/* All Key Features */}
                <div>
                  <h4 className="text-white text-sm font-medium mb-3">Key Features & Capabilities:</h4>
                  <ul className="space-y-2">
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