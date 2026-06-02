export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  technologies: string[];
  coverImage: string;
  galleryImages: string[];
  readmeUrl: string;
  readmeContent?: string;
  detailsType: 'readme' | 'custom';
  customDetails: string;
  customImages: string[];
  category: ProjectCategory;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory =
  | 'mobile'
  | 'web'
  | 'trading'
  | 'ai'
  | 'maintenance'
  | 'all';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  createdAt: string;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  email: string;
  whatsapp: string;
  telegram: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface SiteStats {
  totalProjects: number;
  totalVisits: number;
  featuredProjects: number;
  totalContacts: number;
}

export type Language = 'en' | 'ar';

export interface NavItem {
  label: { en: string; ar: string };
  href: string;
}
