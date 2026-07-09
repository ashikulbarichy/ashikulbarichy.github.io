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
  'name': 'Ashikul Bari Chowdhury | Cyber Security Analyst & GRC Specialist | Dhaka, Bangladesh',
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