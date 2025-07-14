import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Journey from '../components/sections/Journey'
import Skills from '../components/sections/Skills'
import FeaturedProjects from '../components/sections/FeaturedProjects'
import ContactMe from '../components/sections/ContactMe'
import SEOHead from '../components/SEOHead'

export default function Home() {
  return (
    <>
      <SEOHead 
        title="Ashikul Bari Chowdhury - ASP.NET Developer & Project Manager | React, EF Core, ASP.NET Expert"
        description="ASP.NET developer and project manager specializing in React, ASP.NET, EF Core, Python, and modern web applications. Passionate about leading teams and delivering scalable solutions in Dhaka, Bangladesh."
        keywords="Ashikul Bari Chowdhury, full stack developer, project manager, React developer, ASP.NET developer, Python developer, web development, software engineer, team lead, Dhaka Bangladesh, freelance developer, enterprise solutions"
      />
      <Hero />
      <About />
      <Skills />
      <FeaturedProjects />
      <Journey />
      <ContactMe />
    </>
  )
}