'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowLeft,
  Star,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getProjectBySlug, getCachedReadme, cacheReadme, incrementVisits } from '@/lib/data';
import { translations } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = children;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group/code">
      <div className="absolute top-2 left-3 z-10 text-xs font-medium text-white/60 uppercase tracking-wide">
        {language || 'code'}
      </div>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm opacity-0 group-hover/code:opacity-100 transition-opacity hover:bg-white/20"
        aria-label="Copy code"
      >
        {copied ? (
          <><Check className="size-3.5" /> Copied</>
        ) : (
          <><Copy className="size-3.5" /> Copy</>
        )}
      </button>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          padding: '2.75rem 1rem 1rem',
          background: 'oklch(0.13 0.01 106.423)',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

interface TocItem { id: string; text: string; level: number; }

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string | null }) {
  if (items.length === 0) return null;
  return (
    <nav className="space-y-1">
      <h4 className="text-sm font-semibold mb-3 text-foreground/80">Table of Contents</h4>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-xs py-1 transition-colors hover:text-primary ${
                activeId === item.id ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ReadmeViewer({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const markdownRef = useRef<HTMLDivElement>(null);

  const tocItems = useMemo(() => {
    const items: TocItem[] = [];
    content.split('\n').forEach((line) => {
      const match = line.match(/^(#{2,4})\s+(.+)/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[*_`]/g, '');
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        items.push({ id, text, level });
      }
    });
    return items;
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );
    const headings = markdownRef.current?.querySelectorAll('h2, h3, h4');
    headings?.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [content]);

  const components = useMemo(() => ({
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = String(children)?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || Math.random().toString(36).slice(2);
      return <h2 id={id} className="scroll-mt-20" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = String(children)?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || Math.random().toString(36).slice(2);
      return <h3 id={id} className="scroll-mt-20" {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const id = String(children)?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || Math.random().toString(36).slice(2);
      return <h4 id={id} className="scroll-mt-20" {...props}>{children}</h4>;
    },
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
      const match = /language-(\w+)/.exec(className || '');
      const codeText = String(children).replace(/\n$/, '');
      if (!match) return <code className={className} {...props}>{children}</code>;
      return <CodeBlock language={match[1]}>{codeText}</CodeBlock>;
    },
    img: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img alt={alt || ''} {...props} className="max-w-full rounded-lg" loading="lazy" />
    ),
    a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a {...props} target="_blank" rel="noopener noreferrer" />
    ),
  }), []);

  return (
    <div className="flex gap-8">
      <div ref={markdownRef} className="flex-1 min-w-0">
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components as never}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
      <aside className="hidden xl:block w-56 shrink-0">
        <div className="sticky top-24 glass rounded-xl p-4">
          <TableOfContents items={tocItems} activeId={activeId} />
        </div>
      </aside>
    </div>
  );
}

function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  if (!images || images.length === 0) return null;

  return (
    <section className="mb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <h2 className="text-2xl font-bold mb-6">
          <span className="gradient-text">Gallery</span>
        </h2>
        <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIdx}
              src={images[currentIdx]}
              alt={`${title} - Image ${currentIdx + 1}`}
              className="absolute inset-0 size-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/api/placeholder?w=800&h=500&text=Image';
              }}
            />
          </AnimatePresence>
          {images.length > 1 && (
            <>
              <button onClick={() => setCurrentIdx(i => i === 0 ? images.length - 1 : i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => setCurrentIdx(i => i === images.length - 1 ? 0 : i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors">
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentIdx(idx)}
                    className={`size-2 rounded-full transition-all ${idx === currentIdx ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function ReadmeSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

function translateReadme(content: string, targetLang: string): string {
  if (targetLang !== 'ar') return content;
  // If content is already in Arabic or has no text, skip
  const arabicChars = content.match(/[\u0600-\u06FF]/g);
  if (arabicChars && arabicChars.length > 20) return content;
  return content
    .split('\n')
    .map(line => {
      if (line.startsWith('# ') && /^#\s+[A-Z]/.test(line)) {
        const headings: Record<string, string> = {
          'Overview': 'نظرة عامة',
          'Features': 'المميزات',
          'Installation': 'التثبيت',
          'Usage': 'طريقة الاستخدام',
          'Configuration': 'الإعدادات',
          'Contributing': 'المساهمة',
          'License': 'الترخيص',
          'Screenshots': 'لقطات الشاشة',
          'Technologies': 'التقنيات المستخدمة',
          'Getting Started': 'ابدأ الآن',
          'API': 'واجهة برمجة التطبيقات',
          'Documentation': 'التوثيق',
          'Demo': 'عرض توضيحي',
          'Requirements': 'المتطلبات',
          'Setup': 'الإعداد',
          'Testing': 'الاختبارات',
          'Deployment': 'النشر',
          'Support': 'الدعم',
        };
        for (const [en, ar] of Object.entries(headings)) {
          if (line.includes(en)) return line.replace(en, ar);
        }
      }
      return line;
    })
    .join('\n');
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language } = useAppStore();
  const t = translations[language];
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState(false);

  useEffect(() => {
    getProjectBySlug(slug).then((p) => {
      setProject(p);
      setLoading(false);
      if (p) incrementVisits();
    });
  }, [slug]);

  const fetchReadme = useCallback(async () => {
    if (!project?.readmeUrl) return;
    const cached = getCachedReadme(project.readmeUrl);
    if (cached) { setReadme(cached); return; }
    setReadmeLoading(true);
    setReadmeError(false);
    try {
      const res = await fetch(project.readmeUrl);
      if (!res.ok) throw new Error('Failed to fetch README');
      let text = await res.text();
      text = translateReadme(text, language);
      setReadme(text);
      cacheReadme(project.readmeUrl, text);
    } catch {
      setReadmeError(true);
    } finally {
      setReadmeLoading(false);
    }
  }, [project, language]);

  useEffect(() => {
    if (project) fetchReadme();
  }, [project, fetchReadme]);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="aspect-video w-full rounded-2xl mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="size-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-3xl font-bold mb-3">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/projects"><Button><ArrowLeft className="size-4" />{t.projectDetail.backToProjects}</Button></Link>
        </motion.div>
      </main>
    );
  }

  const showCustomDetails = project.detailsType === 'custom' && project.customDetails;
  const detailsContent = showCustomDetails ? project.customDetails : readme;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-2 mb-6 hover:text-primary">
              <ArrowLeft className="size-4" />{t.projectDetail.backToProjects}
            </Button>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {project.featured && (
                  <Badge className="bg-amber-500/90 text-white border-0 gap-1">
                    <Star className="size-3" />{t.projects.featured}
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">{project.category}</Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text">{project.title}</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">{project.shortDescription}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
              <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-2">
                <Calendar className="size-4" />{project.updatedAt}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {project.technologies.map((tech: string) => (
              <Badge key={tech} variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 transition-colors">
                <Tag className="size-3 mr-1" />{tech}
              </Badge>
            ))}
          </div>
        </motion.div>

        {project.galleryImages && project.galleryImages.length > 0 && (
          <ProjectGallery images={project.galleryImages} title={project.title} />
        )}

        {showCustomDetails && project.customImages && project.customImages.length > 0 && (
          <section className="mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <h2 className="text-2xl font-bold mb-6"><span className="gradient-text">Images</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.customImages.map((url: string, idx: number) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden bg-muted aspect-video hover:opacity-90 transition-opacity">
                    <img src={url} alt={`${project.title} custom ${idx + 1}`} className="size-full object-cover" loading="lazy" />
                  </a>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            <span className="gradient-text">{t.projectDetail.readme}</span>
            {project.readmeUrl && !showCustomDetails && (
              <a href={project.readmeUrl} target="_blank" rel="noopener noreferrer"
                className="ml-3 text-sm font-normal text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ExternalLink className="size-3" />{t.projectDetail.source}
              </a>
            )}
          </h2>

          <Card className="overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              {showCustomDetails ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {project.customDetails}
                  </ReactMarkdown>
                </div>
              ) : readmeLoading ? (
                <ReadmeSkeleton />
              ) : readmeError ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Failed to load details.</p>
                  <Button variant="outline" onClick={fetchReadme}>Retry</Button>
                </div>
              ) : readme ? (
                <ReadmeViewer content={readme} />
              ) : project.readmeUrl ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No details available.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No details available for this project.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </main>
  );
}
