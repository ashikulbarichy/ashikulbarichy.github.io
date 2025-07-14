import { useState } from 'react'
import ProjectsHero from '../components/projects/ProjectsHero'
import ProjectsGrid from '../components/projects/ProjectsGrid'
import ProjectsFilter from '../components/projects/ProjectsFilter'
import SEOHead from '../components/SEOHead'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleFilterChange = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <>
      <div className="fixed top-6 left-6 z-30">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect border border-fuchsia-400 text-fuchsia-100 font-semibold shadow-xl hover:bg-fuchsia-600/80 hover:text-white hover:border-fuchsia-500 transition-all duration-200 backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="tracking-tight">Back to Home</span>
        </Link>
      </div>
      <SEOHead 
        title="Projects Portfolio - Ashikul Bari Chowdhury | React, ASP.NET, PostgreSQL Projects"
        description="Explore Ashikul Bari Chowdhury's portfolio of backend development projects including edTech platforms, healthcare research, financial dashboards, and enterprise solutions built with React, ASP.NET, PostgreSQL and Python."
        keywords="Ashikul Bari projects, backend developer portfolio, React projects, ASP.NET projects, Python projects, e-commerce development, healthcare software, financial applications, enterprise solutions, web development portfolio"
        url="https://ashikulbari.me/projects"
      />
      <ProjectsHero />
      <ProjectsFilter onFilterChange={handleFilterChange} />
      <ProjectsGrid selectedCategory={selectedCategory} />
    </>
  )
}