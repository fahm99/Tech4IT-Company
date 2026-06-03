'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Star,
  Smartphone,
  Globe,
  TrendingUp,
  Brain,
  Wrench,
  LayoutGrid,
  ImageOff,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getProjects } from '@/lib/data';
import { translations } from '@/i18n/translations';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.12"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#g)"/>
      <g transform="translate(300 200)" fill="#94a3b8" text-anchor="middle">
        <rect x="-50" y="-40" width="100" height="70" rx="10" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <circle cx="-18" cy="-15" r="8" fill="currentColor"/>
        <path d="M-50 30 L-12 -12 L25 30 L50 0 L50 30 Z" fill="currentColor" opacity="0.7"/>
      </g>
    </svg>`
  );

const categoryIcons: Record<string, React.ReactNode> = {
  all: <LayoutGrid className="size-4" />,
  mobile: <Smartphone className="size-4" />,
  web: <Globe className="size-4" />,
  trading: <TrendingUp className="size-4" />,
  ai: <Brain className="size-4" />,
  maintenance: <Wrench className="size-4" />,
};

const categories: { key: string; label: { en: string; ar: string } }[] = [
  { key: 'all', label: { en: 'All', ar: 'الكل' } },
  { key: 'mobile', label: { en: 'Mobile', ar: 'جوال' } },
  { key: 'web', label: { en: 'Web', ar: 'ويب' } },
  { key: 'trading', label: { en: 'Trading', ar: 'تداول' } },
  { key: 'ai', label: { en: 'AI', ar: 'ذكاء اصطناعي' } },
  { key: 'maintenance', label: { en: 'Maintenance', ar: 'صيانة' } },
];

/**
 * مكون صورة آمن يتعامل مع:
 * - روابط Supabase Storage
 * - روابط HTTP/HTTPS خارجية
 * - روابط نسبية (/projects/...)
 * - أخطاء التحميل (يرجع للصورة الافتراضية)
 */
function SafeImage({
  src,
  alt,
  className = '',
  fallbackText,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isValid = src && src.trim().length > 0 && !errored;
  const finalSrc = isValid ? src : PLACEHOLDER_IMAGE;

  return (
    <div className={`relative size-full overflow-hidden bg-muted ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalSrc}
        alt={alt}
        className={`size-full object-cover transition-all duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } group-hover:scale-105`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!errored) setErrored(true);
        }}
      />
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[3/2] w-full rounded-none" />
      <CardContent className="space-y-3 pt-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md mt-2" />
      </CardContent>
    </Card>
  );
}

function ProjectCard({
  project,
  t,
  index,
  isRTL,
}: {
  project: Project;
  t: typeof translations.en;
  index: number;
  isRTL: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/60 h-full">
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          <SafeImage src={project.coverImage} alt={project.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute top-3 left-3 flex gap-2">
            {project.featured && (
              <Badge className="bg-amber-500/90 text-white border-0 gap-1 backdrop-blur-sm">
                <Star className="size-3" />
                {t.projects.featured}
              </Badge>
            )}
            <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm">
              {categories.find((c) => c.key === project.category)?.label[
                useAppStore.getState().language
              ] || project.category}
            </Badge>
          </div>
        </div>
        <CardContent className="flex flex-col gap-3 pt-4">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          {project.shortDescription && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {project.shortDescription}
            </p>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
          )}
          <Link href={`/projects/${project.slug}`} className="mt-1">
            <Button
              variant="outline"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
            >
              {t.projects.viewDetails}
              {isRTL ? (
                <ArrowLeft className="size-4 mr-1 transition-transform group-hover:-translate-x-1" />
              ) : (
                <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ t }: { t: typeof translations.en }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <ImageOff className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t.projects.noProjects}</h3>
      <p className="text-muted-foreground text-sm max-w-md">
        Try adjusting your search or filter to find what you&apos;re looking for.
      </p>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const {
    language,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useAppStore();
  const t = translations[language];
  const isRTL = language === 'ar';
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getProjects()
      .then((data) => {
        if (cancelled) return;
        setProjects(data);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || 'Failed to load projects');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.shortDescription || '').toLowerCase().includes(query) ||
          (p.description || '').toLowerCase().includes(query) ||
          p.technologies.some((tech) => tech.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [projects, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            {t.projects.heading}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.projects.subheading}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 space-y-4"
        >
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.projects.searchPlaceholder}
              className="pl-10 h-11 bg-card border-border/60 focus-visible:border-primary"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant={selectedCategory === cat.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.key)}
                className={`gap-1.5 transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? 'shadow-md shadow-primary/25'
                    : 'hover:bg-primary/10 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {categoryIcons[cat.key]}
                {cat.label[language]}
              </Button>
            ))}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  t={t}
                  index={index}
                  isRTL={isRTL}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {!isLoading && !error && filteredProjects.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            {filteredProjects.length}{' '}
            {filteredProjects.length === 1 ? 'project' : 'projects'} found
          </motion.p>
        )}
      </div>
    </main>
  );
}
