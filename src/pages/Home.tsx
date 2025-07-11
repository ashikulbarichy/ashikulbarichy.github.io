import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import FeaturedProjects from '../components/sections/FeaturedProjects'
import SEOHead from '../components/SEOHead'

export default function Home() {
  return (
    <>
      <SEOHead 
        title="Ashikul Bari Chowdhury - ASP.NET Developer & Project Manager | React, Angular, ASP.NET Expert"
        description="Experienced full-stack developer and project manager specializing in React, Angular, ASP.NET, Python, and modern web applications. 5+ years experience leading teams and delivering scalable solutions in Dhaka, Bangladesh."
        keywords="Ashikul Bari Chowdhury, full stack developer, project manager, React developer, Angular developer, ASP.NET developer, Python developer, web development, software engineer, team lead, Dhaka Bangladesh, freelance developer, enterprise solutions"
      />
      <Hero />
      <About />
      <Skills />
      <FeaturedProjects />
    </>
  )
}