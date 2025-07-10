import AboutHero from '../components/about/AboutHero'
import PassionStory from '../components/about/Journey'
import Values from '../components/about/Values'
import SEOHead from '../components/SEOHead'

export default function About() {
  return (
    <>
      <SEOHead 
        title="About Ashikul Bari Chowdhury - Full Stack Developer & Project Manager"
        description="Learn about Ashikul Bari Chowdhury's journey as a full-stack developer and project manager. 5+ years of experience in React, Angular, ASP.NET, Python, and leading development teams in Dhaka, Bangladesh."
        keywords="Ashikul Bari Chowdhury about, full stack developer experience, project manager background, React Angular ASP.NET expert, software engineer journey, team leadership experience, Dhaka Bangladesh developer"
        url="https://ashikulbari.dev/about"
      />
      <AboutHero />
      <PassionStory />
      <Values />
    </>
  )
}