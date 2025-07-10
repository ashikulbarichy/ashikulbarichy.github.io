import { useState, useEffect } from 'react'
import { getProjectCategories } from '../../lib/mock-data'

interface ProjectsFilterProps {
  onFilterChange?: (category: string) => void
}

const ProjectsFilter = ({ onFilterChange }: ProjectsFilterProps) => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const projectCategories = getProjectCategories()
    setCategories(projectCategories)
  }, [])

  const filters = [
    { id: 'all', label: 'All Projects' },
    ...categories.map(category => ({
      id: category.toLowerCase().replace(/\s+/g, '-'),
      label: category
    }))
  ]

  const handleFilterClick = (filterId: string, label: string) => {
    setActiveFilter(filterId)
    const categoryValue = filterId === 'all' ? 'all' : label
    onFilterChange?.(categoryValue)
  }

  return (
    <section className="py-8 bg-black/20">
      <div className="container-width section-padding">
        <div className="flex flex-wrap justify-center gap-4">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id, filter.label)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-primary text-primary-foreground'
                  : 'glass-effect text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectsFilter