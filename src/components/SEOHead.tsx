import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getSiteSettings, SiteSettings, defaultSiteSettings } from '../data/landing-page';

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
  title,
  description,
  keywords,
  image,
  url,
  type = 'profile',
  structuredData = null,
}: SEOHeadProps) => {
  const location = useLocation();
  const currentUrl = url || `${BASE_URL}${location.pathname}`;

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    let isMounted = true;
    getSiteSettings().then(data => {
      if (isMounted) setSiteSettings(data);
    });
    return () => { isMounted = false; };
  }, []);

  const activeTitle = title || siteSettings.seoTitle;
  const activeDescription = description || siteSettings.seoDescription;
  const activeKeywords = keywords || siteSettings.seoKeywords;
  const activeImage = image || siteSettings.ogImageUrl || DEFAULT_IMAGE;

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
    setMeta('meta[name="description"]', activeDescription);
    setMeta('meta[name="keywords"]', activeKeywords);

    // ── Open Graph ───────────────────────────────────────────
    setMeta('meta[property="og:type"]', type);
    setMeta('meta[property="og:title"]', activeTitle);
    setMeta('meta[property="og:description"]', activeDescription);
    setMeta('meta[property="og:image"]', activeImage);
    setMeta('meta[property="og:url"]', currentUrl);

    // ── Twitter ──────────────────────────────────────────────
    setMeta('meta[property="twitter:title"]', activeTitle);
    setMeta('meta[property="twitter:description"]', activeDescription);
    setMeta('meta[property="twitter:image"]', activeImage);
    setMeta('meta[property="twitter:url"]', currentUrl);

    // ── Canonical ────────────────────────────────────────────
    setLink('canonical', currentUrl);

    // ── Inject per-page structured data ──────────────────────
    if (structuredData) {
      setJsonLd('page-specific', structuredData);
    }

  }, [activeTitle, activeDescription, activeKeywords, activeImage, currentUrl, type, structuredData]);

  return null;
};

export default SEOHead;