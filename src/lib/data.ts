import { Project, ContactMessage, SiteSettings, SiteStats } from '@/types';
import { supabase } from './supabase';

// ============================================================
//  Projects
// ============================================================

/**
 * جلب جميع المشاريع المنشورة (ما عدا المسودات والمؤرشفة)
 * مع التخزين المؤقت في الذاكرة لتقليل طلبات Supabase
 */
let _projectsCache: { data: Project[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 ثانية

export async function getProjects(): Promise<Project[]> {
  // إرجاع من الكاش إذا كان حديثاً
  if (_projectsCache && Date.now() - _projectsCache.timestamp < CACHE_TTL_MS) {
    return _projectsCache.data;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return _projectsCache?.data ?? [];
    }
    const projects = (data || []).map(mapProject);
    _projectsCache = { data: projects, timestamp: Date.now() };
    return projects;
  } catch (e) {
    console.error('Network error fetching projects:', e);
    return _projectsCache?.data ?? [];
  }
}

/**
 * جلب مشروع واحد عبر الـ slug
 * - لا يُلقي خطأ عند عدم وجود المشروع (يرجع undefined)
 * - يستخدم maybeSingle لتفادي خطأ 406
 */
export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  if (!slug) return undefined;
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error(`Error fetching project '${slug}':`, error);
      return undefined;
    }
    return data ? mapProject(data) : undefined;
  } catch (e) {
    console.error(`Network error fetching project '${slug}':`, e);
    return undefined;
  }
}

/**
 * جلب مشروع عبر المعرف (للاستخدام الداخلي)
 */
export async function getProjectById(id: string): Promise<Project | undefined> {
  if (!id) return undefined;
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching project '${id}':`, error);
      return undefined;
    }
    return data ? mapProject(data) : undefined;
  } catch (e) {
    console.error(`Network error fetching project '${id}':`, e);
    return undefined;
  }
}

/**
 * جلب كل المشاريع (بما فيها المسودات) — للوحة الإدارة فقط
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all projects:', error);
      return [];
    }
    return (data || []).map(mapProject);
  } catch (e) {
    console.error('Network error:', e);
    return [];
  }
}

export async function saveProject(project: Project): Promise<void> {
  const dbProject = unmapProject(project);
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('id', project.id)
    .maybeSingle();

  // مسح الكاش عند التعديل
  _projectsCache = null;

  if (existing) {
    await supabase
      .from('projects')
      .update({ ...dbProject, updated_at: new Date().toISOString() })
      .eq('id', project.id);
  } else {
    await supabase.from('projects').insert(dbProject);
  }
}

export async function deleteProject(id: string): Promise<void> {
  _projectsCache = null;
  await supabase.from('projects').delete().eq('id', id);
}

// ============================================================
//  Messages
// ============================================================
export async function getMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return (data || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      projectType: m.project_type,
      message: m.message,
      isRead: m.is_read ?? false,
      createdAt: m.created_at,
    }));
  } catch (e) {
    console.error('Network error:', e);
    return [];
  }
}

export async function saveMessage(message: ContactMessage): Promise<void> {
  await supabase.from('contact_messages').insert({
    id: message.id,
    name: message.name,
    email: message.email,
    project_type: message.projectType,
    message: message.message,
    is_read: message.isRead ?? false,
    created_at: message.createdAt,
  });
}

export async function markMessageRead(id: string, isRead: boolean): Promise<void> {
  await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id);
}

export async function deleteMessage(id: string): Promise<void> {
  await supabase.from('contact_messages').delete().eq('id', id);
}

// ============================================================
//  Settings
// ============================================================
export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) {
      return DEFAULT_SETTINGS;
    }
    return {
      companyName: data.company_name,
      tagline: data.tagline,
      email: data.email,
      whatsapp: data.whatsapp,
      telegram: data.telegram,
      heroTitle: data.hero_title,
      heroSubtitle: data.hero_subtitle,
      aboutText: data.about_text ?? '',
    };
  } catch (e) {
    console.error('Error fetching settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await supabase
    .from('site_settings')
    .update({
      company_name: settings.companyName,
      tagline: settings.tagline,
      email: settings.email,
      whatsapp: settings.whatsapp,
      telegram: settings.telegram,
      hero_title: settings.heroTitle,
      hero_subtitle: settings.heroSubtitle,
      about_text: settings.aboutText ?? '',
    })
    .eq('id', 1);
}

// ============================================================
//  Stats / Visits
// ============================================================
export async function getStats(): Promise<SiteStats> {
  try {
    const [projectsRes, messagesRes, visitsRes] = await Promise.all([
      supabase.from('projects').select('featured,status'),
      supabase.from('contact_messages').select('id,is_read'),
      supabase.from('visits').select('count'),
    ]);

    const totalVisits = (visitsRes.data || []).reduce(
      (sum: number, v: any) => sum + (v.count || 0),
      0
    );
    const projects = projectsRes.data || [];
    const messages = messagesRes.data || [];

    return {
      totalProjects: projects.length,
      totalVisits,
      featuredProjects: projects.filter((p: any) => p.featured).length,
      publishedProjects: projects.filter((p: any) => p.status === 'published').length,
      totalContacts: messages.length,
      unreadContacts: messages.filter((m: any) => !m.is_read).length,
    };
  } catch (e) {
    console.error('Error fetching stats:', e);
    return {
      totalProjects: 0,
      totalVisits: 0,
      featuredProjects: 0,
      publishedProjects: 0,
      totalContacts: 0,
      unreadContacts: 0,
    };
  }
}

export async function incrementVisits(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('visits')
      .select('count')
      .eq('date', today)
      .maybeSingle();

    if (data) {
      await supabase
        .from('visits')
        .update({ count: (data.count || 0) + 1 })
        .eq('date', today);
    } else {
      await supabase.from('visits').insert({ date: today, count: 1 });
    }
  } catch (e) {
    // لا نُظهر خطأ للمستخدم — العداد ميزة اختيارية
    console.warn('Failed to increment visits:', e);
  }
}

// ============================================================
//  README Cache (localStorage — للتقليل من طلبات الشبكة)
// ============================================================
export function getCachedReadme(url: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const cache = JSON.parse(localStorage.getItem('tech4it_readme_cache') || '{}');
    const entry = cache[url];
    if (entry && Date.now() - entry.timestamp < 60 * 60 * 1000) {
      return entry.content;
    }
    return null;
  } catch {
    return null;
  }
}

export function cacheReadme(url: string, content: string): void {
  if (typeof window === 'undefined') return;
  try {
    const cache = JSON.parse(localStorage.getItem('tech4it_readme_cache') || '{}');
    cache[url] = { content, timestamp: Date.now() };
    localStorage.setItem('tech4it_readme_cache', JSON.stringify(cache));
  } catch {}
}

// ============================================================
//  Mappers (snake_case <-> camelCase)
// ============================================================
function mapProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    technologies: row.technologies || [],
    coverImage: row.cover_image ?? '',
    galleryImages: row.gallery_images || [],
    readmeUrl: row.readme_url ?? '',
    readmeContent: undefined,
    detailsType: (row.details_type ?? 'custom') as 'readme' | 'custom',
    customDetails: row.custom_details ?? '',
    customImages: row.custom_images || [],
    category: (row.category ?? 'mobile') as any,
    featured: !!row.featured,
    status: (row.status ?? 'published') as 'draft' | 'published' | 'archived',
    displayOrder: row.display_order ?? 0,
    metaTitle: row.meta_title ?? '',
    metaDescription: row.meta_description ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? null,
  };
}

function unmapProject(p: Project): any {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    short_description: p.shortDescription,
    description: p.description,
    technologies: p.technologies,
    cover_image: p.coverImage,
    gallery_images: p.galleryImages,
    readme_url: p.readmeUrl,
    details_type: p.detailsType,
    custom_details: p.customDetails,
    custom_images: p.customImages,
    category: p.category,
    featured: p.featured,
    status: p.status,
    display_order: p.displayOrder,
    meta_title: p.metaTitle,
    meta_description: p.metaDescription,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    published_at: p.publishedAt,
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: 'Tech4IT',
  tagline: 'Building Modern Software Solutions',
  email: 'fahmifuadalamere@gmail.com',
  whatsapp: '0576701295',
  telegram: '@tech4it',
  heroTitle: 'Building Modern Software Solutions',
  heroSubtitle:
    'We craft high-performance applications, intelligent trading systems, and AI-powered solutions that drive business growth.',
  aboutText: '',
};
