import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import FeaturedProjects from '../components/sections/FeaturedProjects'
import ContactMe from '../components/sections/ContactMe'
import SEOHead from '../components/SEOHead'

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://ashikulbari.com/#webpage',
  'url': 'https://ashikulbari.com/',
  'name': 'Ashikul Bari Chowdhury | Cyber Security Analyst & GRC Specialist | Melbourne, Australia',
  'description': 'Cyber Security Analyst and GRC Specialist. Open to SOC, GRC, and cybersecurity roles. Expert in risk frameworks, Python, and full-stack development.',
  'inLanguage': 'en-AU',
  'isPartOf': {
    '@id': 'https://ashikulbari.com/#website'
  },
  'about': {
    '@id': 'https://ashikulbari.com/#person'
  },
  'primaryImageOfPage': {
    '@type': 'ImageObject',
    'url': 'https://ashikulbari.com/img/profile_image.webp'
  },
  'datePublished': '2025-01-01',
  'dateModified': '2026-06-15',
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://ashikulbari.com/' }
    ]
  }
}

export default function Home() {
  return (
    <>
      <SEOHead
        title="Ashikul Bari Chowdhury | Cyber Security Analyst & GRC Specialist | Melbourne, Australia"
        description="Cyber Security Analyst and GRC Specialist. Open to SOC, GRC, and cybersecurity roles. Expert in risk frameworks, Python, and full-stack development."
        keywords="Ashikul Bari Chowdhury, cyber security analyst Melbourne, GRC specialist Australia, governance risk compliance Melbourne, La Trobe University cyber security, SOC analyst Melbourne, cybersecurity graduate Australia, information security analyst Victoria, risk analyst Melbourne, compliance analyst Australia, Python developer Melbourne, ASP.NET developer, full stack developer, project manager, software engineer, North South University, Reevolt COO, Dhaka Bangladesh developer"
        url="https://ashikulbari.com/"
        type="profile"
        structuredData={homeStructuredData}
      />
      <Hero />
      <About />
      <FeaturedProjects />
      <ContactMe />
    </>
  )
}