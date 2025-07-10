import { useState } from 'react'
import ProjectsHero from '../components/projects/ProjectsHero'
import ProjectsGrid from '../components/projects/ProjectsGrid'
import ProjectsFilter from '../components/projects/ProjectsFilter'
import SEOHead from '../components/SEOHead'

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleFilterChange = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <>
      <SEOHead 
        title="Projects Portfolio - Ashikul Bari Chowdhury | React, Angular, ASP.NET Projects"
        description="Explore Ashikul Bari Chowdhury's portfolio of full-stack development projects including e-commerce platforms, healthcare systems, financial dashboards, and enterprise solutions built with React, Angular, ASP.NET, and Python."
        keywords="Ashikul Bari projects, full stack developer portfolio, React projects, Angular projects, ASP.NET projects, Python projects, e-commerce development, healthcare software, financial applications, enterprise solutions, web development portfolio"
        url="https://ashikulbari.dev/projects"
      />
      <ProjectsHero />
      <ProjectsFilter onFilterChange={handleFilterChange} />
      <ProjectsGrid selectedCategory={selectedCategory} />
    </>
  )
}