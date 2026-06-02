'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Smartphone,
  Globe,
  TrendingUp,
  Brain,
  Wrench,
  Sparkles,
  Quote,
  Code2,
  Layers,
  Zap,
  Users,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { translations } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="size-6" />,
  Globe: <Globe className="size-6" />,
  TrendingUp: <TrendingUp className="size-6" />,
  Brain: <Brain className="size-6" />,
  Wrench: <Wrench className="size-6" />,
};

/* ------------------------------------------------------------------ */
/*  Animated Counter                                                   */
/* ------------------------------------------------------------------ */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    let current = 0;
    const step = Math.max(1, Math.floor(end / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= end) {
        current = end;
        clearInterval(interval);
      }
      el.textContent = `${current}${suffix}`;
    }, 30);
    return () => clearInterval(interval);
  }, [inView, end, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ------------------------------------------------------------------ */
/*  Fade-up wrapper                                                    */
/* ------------------------------------------------------------------ */
function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Home Page                                                     */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const { language } = useAppStore();
  const t = translations[language];

  return (
    <main className="overflow-hidden">
      {/* ============================================================ */}
      {/*  HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="hero-glow top-1/4 left-1/2 -translate-x-1/2" />
          <div className="absolute top-20 left-[10%] animate-float opacity-[0.07]">
            <Code2 className="size-16" />
          </div>
          <div className="absolute top-40 right-[15%] animate-float-delayed opacity-[0.07]">
            <Layers className="size-12" />
          </div>
          <div className="absolute bottom-32 left-[20%] animate-float-slow opacity-[0.07]">
            <Zap className="size-14" />
          </div>
          <div className="absolute bottom-40 right-[10%] animate-float opacity-[0.07]">
            <Sparkles className="size-10" />
          </div>
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Badge
              variant="outline"
              className="gap-2 px-4 py-2 text-sm border-primary/20 bg-primary/5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {language === 'en' ? 'Software Solutions Company' : 'شركة حلول برمجية'}
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
          >
            <span className="gradient-text">{t.hero.title.split(' ').slice(0, 2).join(' ')}</span>
            <br />
            <span className="gradient-text">
              {t.hero.title.split(' ').slice(2).join(' ')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/projects">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 gap-2"
              >
                {t.hero.cta1}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                {t.hero.cta2}
              </Button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
              <span className="text-xs uppercase tracking-widest">
                {language === 'en' ? 'Scroll to explore' : 'مرر للاستكشاف'}
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SERVICES SECTION                                             */}
      {/* ============================================================ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
              {t.services.heading}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.services.subheading}
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.services.items.map((service, i) => (
              <FadeUp key={service.title} delay={i * 0.1}>
                <Card className="group h-full glass border-border/40 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/25">
                      {iconMap[service.icon]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                      {service.techs.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  STATS SECTION                                                */}
      {/* ============================================================ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">
              {t.stats.heading}
            </h2>
          </FadeUp>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: 50, suffix: '+', label: t.stats.projects, icon: <Layers className="size-5" /> },
              { value: 30, suffix: '+', label: t.stats.clients, icon: <Users className="size-5" /> },
              { value: 20, suffix: '+', label: t.stats.technologies, icon: <Code2 className="size-5" /> },
              { value: 99, suffix: '.9%', label: t.stats.uptime, icon: <Clock className="size-5" /> },
            ].map((stat, i) => (
              <FadeUp key={stat.label} delay={i * 0.1}>
                <Card className="glass border-border/40 text-center">
                  <CardContent className="p-6 sm:p-8 flex flex-col items-center gap-3">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold gradient-text">
                      <Counter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS SECTION                                         */}
      {/* ============================================================ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
              {t.testimonials.heading}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t.testimonials.subheading}
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.testimonials.items.map((item, i) => (
              <FadeUp key={item.name} delay={i * 0.15}>
                <Card className="h-full glass border-border/40 hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6 flex flex-col gap-5">
                    <Quote className="size-8 text-primary/30 shrink-0" />
                    <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {item.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA SECTION                                                  */}
      {/* ============================================================ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <Card className="relative overflow-hidden border-primary/20 shadow-2xl shadow-primary/10">
              {/* Background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
              </div>
              <CardContent className="relative z-10 p-10 sm:p-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  {language === 'en'
                    ? 'Ready to Start Your Project?'
                    : 'هل أنت مستعد لبدء مشروعك؟'}
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  {language === 'en'
                    ? "Let's turn your vision into reality. Get in touch and let's build something amazing together."
                    : 'دعنا نحوّل رؤيتك إلى واقع. تواصل معنا ولنبنِ شيئاً مذهلاً معاً.'}
                </p>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="h-12 px-10 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 gap-2"
                  >
                    {t.hero.cta2}
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeUp>
        </div>
      </section>
    </main>
  );
}
