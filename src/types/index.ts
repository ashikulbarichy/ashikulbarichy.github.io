// ─── Shared Type Definitions ──────────────────────────────────────────────────
// Single source of truth for all shared interfaces across the portfolio.
// Import types from here rather than from individual data/lib files.

// ── Landing / Hero ────────────────────────────────────────────────────────────

export interface LandingPageData {
  heroName: string;
  heroRole: string;
  heroSubtitle: string;
  heroLocation: string;
  profilePicUrl?: string;
  certifications: string[];
  skills: string[];
  cvUrl?: string;
}

// ── Navigation / Menu ─────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface MenuData {
  brandFirst: string;
  brandLast: string;
  email: string;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
}

// ── About Slides ──────────────────────────────────────────────────────────────

export interface AboutSlide {
  id: string;
  tag: string;
  outlineText: string;
  title: string;
  description: string;
  timelinePoints: string[];
  order: number;
  logoUrl?: string;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export interface Project {
  id: number | string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  category: string;
  date: string;
  duration: string;
  features: string[];
  githubUrl: string;
  projectUrl: string;
  isLive: boolean;
  type: 'application' | 'case-study' | 'research';
}

export interface ProjectStats {
  totalProjects: number;
  totalTechnologies: number;
  categories: { category: string; count: number }[];
  averageDuration: string;
}
