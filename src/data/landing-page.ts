import { client, isSanityConfigured } from '../lib/sanity'

export interface LandingPageData {
  heroName: string
  heroRole: string
  heroSubtitle: string
  heroLocation: string
  profilePicUrl?: string
  certifications: string[]
  skills: string[]
  cvUrl?: string
}

export interface NavLink {
  label: string
  href: string
}

export interface SocialLink {
  platform: string
  url: string
}

export interface MenuData {
  brandFirst: string
  brandLast: string
  email: string
  navLinks: NavLink[]
  socialLinks: SocialLink[]
}

export interface AboutSlide {
  id: string
  tag: string
  outlineText: string
  title: string
  description: string
  timelinePoints: string[]
  order: number
  logoUrl?: string
}


export const defaultLandingData: LandingPageData = {
  heroName: 'Ashikul Bari Chowdhury',
  heroRole: 'Cyber Security Analyst',
  heroSubtitle: "I'm a dedicated Developer, channeling logic, security, and expertise into crafting robust architectures that power modern web systems.",
  heroLocation: 'Dhaka, Bangladesh',
  profilePicUrl: '/img/profile_image.webp',
  certifications: [
    'Google Cybersecurity Fundamentals',
    'Tiny R&D Be a Project Manager Bootcamp'
  ],
  skills: [
    'PostgreSQL',
    'React',
    'Python',
    'TypeScript',
    'SQL',
    'Git',
    'Agile/PM',
    'Web App Security'
  ],
  cvUrl: 'https://www.dropbox.com/scl/fi/mi6xs19gw2xd7axkzsrxn/ashikul-bari-cv.pdf?rlkey=0l4xas6blt87hsbujvwl1ggkg&st=mc03tqr4&dl=1',
}

export const defaultMenuData: MenuData = {
  brandFirst: 'ashikul',
  brandLast: '.',
  email: 'ashikul.chowdhury@proton.me',
  navLinks: [
    { label: 'Home', href: '#' },
    { label: 'Projects', href: '#featured-projects' }
  ],
  socialLinks: [
    { platform: 'GitHub', url: 'https://github.com/ashikulbarichy' },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/ashikulbarichy' }
  ]
}

export async function getLandingData(): Promise<LandingPageData> {
  if (isSanityConfigured && client) {
    try {
      // Only query the `hero` document type — `landingPage` has been removed
      const query = `*[_type == "hero"][0] {
        heroName,
        heroRole,
        heroSubtitle,
        heroLocation,
        profilePic,
        cvUrl,
        certifications,
        skills
      }`;
      const sanityData = await client.fetch<any>(query);
      if (sanityData) {
        const { urlFor } = await import('../lib/sanity');
        return {
          heroName: sanityData.heroName || defaultLandingData.heroName,
          heroRole: sanityData.heroRole || defaultLandingData.heroRole,
          heroSubtitle: sanityData.heroSubtitle || defaultLandingData.heroSubtitle,
          heroLocation: sanityData.heroLocation || defaultLandingData.heroLocation,
          profilePicUrl:
            (sanityData.profilePic && typeof sanityData.profilePic === 'object'
              ? urlFor(sanityData.profilePic)
              : null) || defaultLandingData.profilePicUrl,
          certifications: sanityData.certifications || defaultLandingData.certifications,
          skills: sanityData.skills || defaultLandingData.skills,
          cvUrl: sanityData.cvUrl || defaultLandingData.cvUrl,
        };
      }
    } catch (error) {
      console.error('Error fetching landing page data from Sanity, falling back to defaults:', error);
    }
  }
  return defaultLandingData;
}

export async function getMenuData(): Promise<MenuData> {
  if (isSanityConfigured && client) {
    try {
      const query = `*[_type == "menu"][0] {
        brandFirst,
        brandLast,
        email,
        navLinks[] {
          label,
          href
        },
        socialLinks[] {
          platform,
          url
        }
      }`
      const sanityData = await client.fetch<any>(query)
      if (sanityData) {
        return {
          brandFirst: sanityData.brandFirst || defaultMenuData.brandFirst,
          brandLast: sanityData.brandLast || defaultMenuData.brandLast,
          email: sanityData.email || defaultMenuData.email,
          navLinks: sanityData.navLinks && sanityData.navLinks.length > 0 ? sanityData.navLinks : defaultMenuData.navLinks,
          socialLinks: sanityData.socialLinks && sanityData.socialLinks.length > 0 ? sanityData.socialLinks : defaultMenuData.socialLinks,
        }
      }
    } catch (error) {
      console.error('Error fetching menu data from Sanity, falling back to defaults:', error)
    }
  }
  return defaultMenuData
}

export const defaultAboutSlides: AboutSlide[] = [
  {
    id: '01',
    tag: 'Education / B.Sc.',
    outlineText: 'EDUCATION',
    title: 'B.Sc. in Computer Science & Engineering',
    description: 'Completed my Bachelor of Science in Computer Science & Engineering from North South University, building a strong foundation in software engineering, algorithms, database systems, and computer networks.',
    timelinePoints: ['2020', '2025'],
    order: 1,
    logoUrl: '/img/nsu_logo.png'
  },
  {
    id: '02',
    tag: 'Education / M.Sc.',
    outlineText: 'SECURITY',
    title: 'Pursuing Masters at La Trobe University',
    description: 'Currently pursuing my Master of Cyber Security at La Trobe University, focusing on advanced network security, digital forensics, and threat intelligence architectures.',
    timelinePoints: ['2026', '2027', '2028'],
    order: 2,
    logoUrl: '/img/latrobe_logo.png'
  },
  {
    id: '03',
    tag: 'Reevolt COO',
    outlineText: 'REEVOLT',
    title: 'COO Role at Reevolt',
    description: 'Directing strategic operations, managing project deliverables, and leading cross-functional teams at Reevolt to align developer efforts with business scaling goals.',
    timelinePoints: ['2025', '2026', 'Present'],
    order: 3,
    logoUrl: '/img/reevolt_logo.svg'
  },
  {
    id: '04',
    tag: 'Python Developer',
    outlineText: 'HOMELAB',
    title: 'Personal Cyber Lab & Python Dev',
    description: 'Engineering home lab projects to master security configurations, automation scripting, and threat emulation workflows using Python development.',
    timelinePoints: ['2026', 'Present'],
    order: 4,
    logoUrl: '/img/python_logo.png'
  }
]

export async function getAboutSlides(): Promise<AboutSlide[]> {
  if (isSanityConfigured && client) {
    try {
      const query = `*[_type == "aboutSlide"] | order(order asc) {
        "id": coalesce(id, string(_id)),
        tag,
        outlineText,
        title,
        description,
        timelinePoints,
        order,
        logo
      }`;
      const sanityData = await client.fetch<any[]>(query);
      if (sanityData && sanityData.length > 0) {
        const { urlFor } = await import('../lib/sanity');
        return sanityData.map((slide) => {
          const defaultSlide = defaultAboutSlides.find(
            (d) => d.id === slide.id || d.order === slide.order
          );
          return {
            id: slide.id,
            tag: slide.tag,
            outlineText: slide.outlineText,
            title: slide.title,
            description: slide.description,
            timelinePoints: slide.timelinePoints,
            order: slide.order,
            logoUrl:
              (slide.logo && typeof slide.logo === 'object'
                ? urlFor(slide.logo)
                : null) || defaultSlide?.logoUrl,
          };
        });
      }
    } catch (error) {
      console.error('Error fetching about slides from Sanity, falling back to defaults:', error);
    }
  }
  return defaultAboutSlides;
}


