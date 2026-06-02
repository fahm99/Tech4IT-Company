'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Sun, Moon, Menu, Terminal } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useAppStore } from '@/store';
import { translations } from '@/i18n/translations';

const navLinks = [
  { key: 'home' as const, href: '/' },
  { key: 'projects' as const, href: '/projects' },
  { key: 'contact' as const, href: '/contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage } = useAppStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const t = translations[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- needed to avoid hydration mismatch with next-themes
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const dir = isRTL ? 'rtl' : 'ltr';
    const lang = language;
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [language, isRTL, mounted]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full"
    >
      <nav className="glass border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Terminal className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Tech</span>
              <span className="text-foreground">4IT</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-md px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <span
                  className={
                    isActive(link.href)
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }
                >
                  {t.nav[link.key]}
                </span>
                {isActive(link.href) && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-md bg-primary/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="gap-1.5 text-sm"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {language === 'en' ? 'AR' : 'EN'}
                </span>
              </Button>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={resolvedTheme}
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {resolvedTheme === 'dark' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </motion.div>
                </AnimatePresence>
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Mobile Hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRTL ? 'left' : 'right'}
                className="w-72"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    <span>
                      <span className="gradient-text">Tech</span>
                      <span>4IT</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                          isActive(link.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                      >
                        {t.nav[link.key]}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="mt-4 flex items-center gap-2 border-t pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleLanguage}
                      className="gap-1.5 flex-1"
                    >
                      <Globe className="h-4 w-4" />
                      {language === 'en' ? 'العربية' : 'English'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="h-9 w-9"
                    >
                      {resolvedTheme === 'dark' ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
