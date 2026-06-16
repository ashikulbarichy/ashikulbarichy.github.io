import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'profile' | 'article';
  structuredData?: Record<string, unknown> | null;
}

const BASE_URL = 'https://ashikulbari.com';
const DEFAULT_IMAGE = `${BASE_URL}/img/profile_image.webp`;

const SEOHead = ({
  title = 'Ashikul Bari Chowdhury | Cyber Security Analyst & GRC Specialist | Melbourne, Australia',
  description = 'Cyber Security Analyst and GRC Specialist. Open to SOC, GRC, and cybersecurity roles. Expert in risk frameworks, Python, and full-stack development.',
  keywords = 'Ashikul Bari Chowdhury, cyber security analyst Melbourne, GRC specialist Australia, governance risk compliance Melbourne, La Trobe University cyber security, SOC analyst Melbourne, information security analyst Victoria, risk analyst Australia, compliance analyst Melbourne, cybersecurity graduate Melbourne, Python developer, ASP.NET developer, full stack developer, project manager, software engineer, Dhaka Bangladesh',
  image = DEFAULT_IMAGE,
  url,
  type = 'profile',
  structuredData = null,
}: SEOHeadProps) => {
  const location = useLocation();
  const currentUrl = url || `${BASE_URL}${location.pathname}`;

  useEffect(() => {
    // ── Title ────────────────────────────────────────────────
    document.title = 'ashikul bari';

    // ── Helper ───────────────────────────────────────────────
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (el) {
        el.setAttribute('content', content);
      } else {
        el = document.createElement('meta');
        // Detect property vs name from selector
        if (selector.includes('property=')) {
          el.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] ?? '');
        } else {
          el.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] ?? '');
        }
        el.setAttribute('content', content);
        document.head.appendChild(el);
      }
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (el) {
        el.setAttribute('href', href);
      } else {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        el.setAttribute('href', href);
        document.head.appendChild(el);
      }
    };

    const setJsonLd = (id: string, data: Record<string, unknown>) => {
      let el = document.querySelector<HTMLScriptElement>(`script[type="application/ld+json"][data-id="${id}"]`);
      if (!el) {
        el = document.createElement('script');
        el.setAttribute('type', 'application/ld+json');
        el.setAttribute('data-id', id);
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data, null, 2);
    };

    // ── Basic Meta ───────────────────────────────────────────
    setMeta('meta[name="description"]', description);
    setMeta('meta[name="keywords"]', keywords);

    // ── Open Graph ───────────────────────────────────────────
    setMeta('meta[property="og:type"]', type);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[property="og:url"]', currentUrl);

    // ── Twitter ──────────────────────────────────────────────
    setMeta('meta[property="twitter:title"]', title);
    setMeta('meta[property="twitter:description"]', description);
    setMeta('meta[property="twitter:image"]', image);
    setMeta('meta[property="twitter:url"]', currentUrl);

    // ── Canonical ────────────────────────────────────────────
    setLink('canonical', currentUrl);

    // ── Inject per-page structured data ──────────────────────
    if (structuredData) {
      setJsonLd('page-specific', structuredData);
    }

  }, [title, description, keywords, image, currentUrl, type, structuredData]);

  return null;
};

export default SEOHead;