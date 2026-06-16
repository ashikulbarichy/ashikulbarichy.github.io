import { useState } from 'react'
import ProjectsGrid from '../components/projects/ProjectsGrid'
import SEOHead from '../components/SEOHead'

const projectsStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': 'https://ashikulbari.com/projects#webpage',
  'url': 'https://ashikulbari.com/projects',
  'name': 'Projects — Ashikul Bari Chowdhury | Melbourne Developer Portfolio',
  'description': "A collection of full-stack web development, cyber security, and data engineering projects by Ashikul Bari Chowdhury — Cyber Security Analyst and GRC Specialist based in Melbourne, Australia. Projects built with React, ASP.NET Core, Python, PostgreSQL, and more.",
  'inLanguage': 'en-AU',
  'isPartOf': {
    '@id': 'https://ashikulbari.com/#website'
  },
  'author': {
    '@id': 'https://ashikulbari.com/#person'
  },
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://ashikulbari.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Projects', 'item': 'https://ashikulbari.com/projects' }
    ]
  }
}

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleFilterChange = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <>
      <SEOHead
        title="Projects — Ashikul Bari Chowdhury | Cyber Security & Full Stack Portfolio | Melbourne"
        description="Explore the full project portfolio of Ashikul Bari Chowdhury — Cyber Security Analyst and GRC Specialist based in Melbourne, Australia. Includes edTech platforms, healthcare research systems, financial dashboards, security automation tools, and enterprise web applications built with React, ASP.NET Core, Python, and PostgreSQL."
        keywords="Ashikul Bari projects, Ashikul Bari Chowdhury portfolio, cyber security projects Melbourne, GRC projects Australia, backend developer portfolio Melbourne, React projects, ASP.NET Core projects, Python security tools, edTech platform, healthcare software, financial dashboard, enterprise web applications, full stack developer portfolio Melbourne, security automation Python, web development portfolio Australia"
        url="https://ashikulbari.com/projects"
        type="website"
        structuredData={projectsStructuredData}
      />
      <ProjectsGrid selectedCategory={selectedCategory} onFilterChange={handleFilterChange} />
    </>
  )
}