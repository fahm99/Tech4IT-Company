'use client';

import Link from 'next/link';
import { Terminal, Github, Mail, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { translations } from '@/i18n/translations';

export function Footer() {
  const { language } = useAppStore();
  const t = translations[language];
  const year = new Date().getFullYear();

  const footerLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.projects, href: '/projects' },
    { label: t.nav.contact, href: '/contact' },
  ];

  const socialLinks = [
    {
      label: 'GitHub',
      href: 'https://github.com/tech4it',
      icon: Github,
    },
    {
      label: 'Email',
      href: 'mailto:info@tech4it.dev',
      icon: Mail,
    },
  ];

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Terminal className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">
                <span className="gradient-text">Tech</span>
                <span className="text-foreground">4IT</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:shadow-sm"
                aria-label={link.label}
              >
                <link.icon className="h-4 w-4" />
                <ArrowUpRight className="sr-only h-3 w-3" />
              </a>
            ))}
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-8 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {year} Tech4IT. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
