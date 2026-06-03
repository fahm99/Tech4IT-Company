export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
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
  status: 'draft' | 'published' | 'archived';
  displayOrder: number;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
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
  isRead: boolean;
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
  aboutText: string;
}

export interface SiteStats {
  totalProjects: number;
  totalVisits: number;
  featuredProjects: number;
  publishedProjects: number;
  totalContacts: number;
  unreadContacts: number;
}

export type Language = 'en' | 'ar';

export interface NavItem {
  label: { en: string; ar: string };
  href: string;
}
