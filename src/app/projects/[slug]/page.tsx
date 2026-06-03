'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { translations } from '@/i18n/translations';
import { getProjectBySlug, getCachedReadme, cacheReadme, incrementVisits } from '@/lib/data';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// الصورة الاحتياطية كـ SVG مضمّن (شفاف ومتوفر دائماً)
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.15"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#g)"/>
      <g transform="translate(400 250)" fill="#64748b" text-anchor="middle">
        <rect x="-40" y="-40" width="80" height="60" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="-15" cy="-15" r="6" fill="currentColor"/>
        <path d="M-40 20 L-10 -10 L20 20 L40 0 L40 20 Z" fill="currentColor" opacity="0.6"/>
      </g>
      <text x="400" y="340" font-family="system-ui" font-size="20" fill="#64748b" text-anchor="middle">No Image</text>
    </svg>`
  );

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
    img: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
      // إصلاح src الفارغ أو غير الصالح
      const safeSrc = src && typeof src === 'string' && src.trim().length > 0 ? src : PLACEHOLDER_IMAGE;
      return (
        <span className="block my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={alt || ''}
            src={safeSrc}
            {...props}
            loading="lazy"
            className="max-w-full rounded-lg mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
        </span>
      );
    },
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
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) return null;

  // فلترة الصور الصالحة فقط
  const validImages = images.filter((_, i) => !imgErrors.has(i));
  if (validImages.length === 0) return null;

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
              src={validImages[currentIdx] || PLACEHOLDER_IMAGE}
              alt={`${title} - Image ${currentIdx + 1}`}
              className="absolute inset-0 size-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onError={() => {
                setImgErrors((prev) => new Set(prev).add(images.indexOf(validImages[currentIdx])));
              }}
            />
          </AnimatePresence>
          {validImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIdx((i) => (i === 0 ? validImages.length - 1 : i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => setCurrentIdx((i) => (i === validImages.length - 1 ? 0 : i + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {validImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    aria-label={`Go to image ${idx + 1}`}
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

function CustomImagesGrid({ images, title }: { images: string[]; title: string }) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  if (!images || images.length === 0) return null;

  const validImages = images
    .map((url, idx) => ({ url, idx }))
    .filter(({ idx }) => !imgErrors.has(idx));

  if (validImages.length === 0) return null;

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h2 className="text-2xl font-bold mb-6">
          <span className="gradient-text">Images</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validImages.map(({ url, idx }) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden bg-muted aspect-video hover:opacity-90 transition-opacity relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${title} custom ${idx + 1}`}
                className="size-full object-cover"
                loading="lazy"
                onError={() => setImgErrors((prev) => new Set(prev).add(idx))}
              />
            </a>
          ))}
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
  const arabicChars = content.match(/[\u0600-\u06FF]/g);
  if (arabicChars && arabicChars.length > 20) return content;
  return content
    .split('\n')
    .map((line) => {
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
  const slug = params?.slug as string | undefined;
  const { language } = useAppStore();
  const t = translations[language];
  const isRTL = language === 'ar';
  const [project, setProject] = useState<Project | null | undefined>(undefined); // undefined = loading, null = not found
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState(false);

  // جلب المشروع
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setProject(undefined); // loading
    getProjectBySlug(slug)
      .then((p) => {
        if (cancelled) return;
        setProject(p ?? null);
        if (p) incrementVisits();
      })
      .catch(() => {
        if (!cancelled) setProject(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const fetchReadme = useCallback(async () => {
    if (!project?.readmeUrl) {
      setReadme(null);
      return;
    }
    const cached = getCachedReadme(project.readmeUrl);
    if (cached) {
      setReadme(cached);
      return;
    }
    setReadmeLoading(true);
    setReadmeError(false);
    try {
      // timeout 12 ثانية لتفادي الانتظار الطويل
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(project.readmeUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let text = await res.text();
      text = translateReadme(text, language);
      setReadme(text);
      cacheReadme(project.readmeUrl, text);
    } catch (e) {
      console.warn('Failed to fetch README:', e);
      setReadmeError(true);
    } finally {
      setReadmeLoading(false);
    }
  }, [project, language]);

  useEffect(() => {
    if (project) fetchReadme();
  }, [project, fetchReadme]);

  // حالة التحميل
  if (project === undefined) {
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

  // المشروع غير موجود
  if (project === null) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="size-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">
            المشروع الذي تبحث عنه غير موجود أو تم حذفه.
          </p>
          <Link href="/projects">
            <Button>
              {isRTL ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
              {t.projectDetail.backToProjects}
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  const showCustomDetails =
    project.detailsType === 'custom' && (project.customDetails?.trim().length ?? 0) > 0;
  const hasReadme = (project.readmeUrl?.trim().length ?? 0) > 0;

  // تنسيق التاريخ بأمان
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(
        isRTL ? 'ar-SA' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-2 mb-6 hover:text-primary">
              {isRTL ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
              {t.projectDetail.backToProjects}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {project.featured && (
                  <Badge className="bg-amber-500/90 text-white border-0 gap-1">
                    <Star className="size-3" />
                    {t.projects.featured}
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  {project.category}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
                {project.title}
              </h1>
              {project.shortDescription && (
                <p className="text-muted-foreground text-lg max-w-2xl">
                  {project.shortDescription}
                </p>
              )}
              {project.description && (
                <p className="text-foreground/80 text-base max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
              {project.publishedAt && (
                <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-2">
                  <Calendar className="size-4" />
                  {formatDate(project.publishedAt)}
                </div>
              )}
            </div>
          </div>

          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {project.technologies.map((tech: string) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                >
                  <Tag className="size-3 mr-1" />
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>

        {/* صورة الغلاف */}
        {project.coverImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.coverImage}
                alt={project.title}
                className="size-full object-cover"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
          </motion.div>
        )}

        {/* معرض الصور */}
        {project.galleryImages && project.galleryImages.length > 0 && (
          <ProjectGallery images={project.galleryImages} title={project.title} />
        )}

        {/* الصور المخصصة */}
        <CustomImagesGrid
          images={project.customImages || []}
          title={project.title}
        />

        {/* قسم التفاصيل / README */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">
            <span className="gradient-text">{t.projectDetail.readme}</span>
            {hasReadme && !showCustomDetails && (
              <a
                href={project.readmeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 text-sm font-normal text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <ExternalLink className="size-3" />
                {t.projectDetail.source}
              </a>
            )}
          </h2>

          <Card className="overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              {showCustomDetails ? (
                <div className="markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {project.customDetails}
                  </ReactMarkdown>
                </div>
              ) : hasReadme ? (
                readmeLoading ? (
                  <ReadmeSkeleton />
                ) : readmeError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      تعذر تحميل ملف README من الرابط المحدد.
                    </p>
                    <Button variant="outline" onClick={fetchReadme}>
                      إعادة المحاولة
                    </Button>
                  </div>
                ) : readme ? (
                  <ReadmeViewer content={readme} />
                ) : (
                  <EmptyDetails />
                )
              ) : (
                <EmptyDetails />
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </main>
  );
}

function EmptyDetails() {
  return (
    <div className="text-center py-12">
      <ImageIcon className="size-10 text-muted-foreground/50 mx-auto mb-3" />
      <p className="text-muted-foreground">
        لا توجد تفاصيل مضافة لهذا المشروع بعد.
      </p>
    </div>
  );
}
