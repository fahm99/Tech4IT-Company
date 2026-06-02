import { Project, ContactMessage, SiteSettings, SiteStats } from '@/types';
import { SEED_PROJECTS, DEFAULT_SETTINGS } from '@/data/seed-data';
import { supabase } from './supabase';

// ============================================================
//  Projects
// ============================================================
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return (data || []).map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error || !data) return undefined;
  return mapProject(data);
}

export async function saveProject(project: Project): Promise<void> {
  const dbProject = unmapProject(project);
  const existing = await supabase
    .from('projects')
    .select('id')
    .eq('id', project.id)
    .single();

  if (existing.data) {
    await supabase
      .from('projects')
      .update({ ...dbProject, updated_at: new Date().toISOString().split('T')[0] })
      .eq('id', project.id);
  } else {
    await supabase
      .from('projects')
      .insert(dbProject);
  }
}

export async function deleteProject(id: string): Promise<void> {
  await supabase
    .from('projects')
    .delete()
    .eq('id', id);
}

// ============================================================
//  Messages
// ============================================================
export async function getMessages(): Promise<ContactMessage[]> {
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
    createdAt: m.created_at,
  }));
}

export async function saveMessage(message: ContactMessage): Promise<void> {
  await supabase
    .from('contact_messages')
    .insert({
      id: message.id,
      name: message.name,
      email: message.email,
      project_type: message.projectType,
      message: message.message,
      created_at: message.createdAt,
    });
}

export async function deleteMessage(id: string): Promise<void> {
  await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);
}

// ============================================================
//  Settings
// ============================================================
export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (error || !data) return DEFAULT_SETTINGS;
  return {
    companyName: data.company_name,
    tagline: data.tagline,
    email: data.email,
    whatsapp: data.whatsapp,
    telegram: data.telegram,
    heroTitle: data.hero_title,
    heroSubtitle: data.hero_subtitle,
  };
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
    })
    .eq('id', 1);
}

// ============================================================
//  Stats / Visits
// ============================================================
export async function getStats(): Promise<SiteStats> {
  const { data: projects } = await supabase.from('projects').select('featured');
  const { data: messages } = await supabase.from('contact_messages').select('id');
  const { data: visits } = await supabase.from('visits').select('count');

  const totalVisits = (visits || []).reduce((sum: number, v: any) => sum + (v.count || 0), 0);
  return {
    totalProjects: (projects || []).length,
    totalVisits,
    featuredProjects: (projects || []).filter((p: any) => p.featured).length,
    totalContacts: (messages || []).length,
  };
}

export async function incrementVisits(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('visits')
    .select('count')
    .eq('date', today)
    .single();

  if (data) {
    await supabase
      .from('visits')
      .update({ count: (data.count || 0) + 1 })
      .eq('date', today);
  } else {
    await supabase
      .from('visits')
      .insert({ date: today, count: 1 });
  }
}

// ============================================================
//  README Cache (still uses localStorage for performance)
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
//  Seed helper — call once to populate initial data
// ============================================================
export async function seedIfEmpty(): Promise<void> {
  const { count, error } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });
  if (error || (count ?? 0) > 0) return;

  // Seed projects
  for (const p of SEED_PROJECTS) {
    await supabase.from('projects').insert(unmapProject(p));
  }
}

// ============================================================
//  Mappers (snake_case <-> camelCase)
// ============================================================
function mapProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    technologies: row.technologies || [],
    coverImage: row.cover_image,
    galleryImages: row.gallery_images || [],
    readmeUrl: row.readme_url,
    readmeContent: undefined,
    detailsType: row.details_type || 'readme',
    customDetails: row.custom_details || '',
    customImages: row.custom_images || [],
    category: row.category,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function unmapProject(p: Project): any {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    short_description: p.shortDescription,
    technologies: p.technologies,
    cover_image: p.coverImage,
    gallery_images: p.galleryImages,
    readme_url: p.readmeUrl,
    details_type: p.detailsType,
    custom_details: p.customDetails,
    custom_images: p.customImages,
    category: p.category,
    featured: p.featured,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}
