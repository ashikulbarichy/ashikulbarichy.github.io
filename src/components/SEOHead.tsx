import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SEOHead = ({ 
  title = "Ashikul Bari Chowdhury - Full Stack Developer & Project Manager",
  description = "Experienced full-stack developer and project manager specializing in React, Angular, ASP.NET, Python, and modern web applications. 5+ years experience leading teams and delivering scalable solutions.",
  keywords = "Ashikul Bari Chowdhury, full stack developer, project manager, React developer, Angular developer, ASP.NET developer, Python developer, web development, software engineer, team lead, Dhaka Bangladesh",
  image = "https://ashikulbari.dev/Ashikul_Bari_CV.png",
  url
}: SEOHeadProps) => {
  const location = useLocation();
  const currentUrl = url || `https://ashikulbari.dev${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);

    // Update Twitter tags
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:url', currentUrl, true);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', currentUrl);
      document.head.appendChild(canonicalLink);
    }
  }, [title, description, keywords, image, currentUrl]);

  return null;
};

export default SEOHead;