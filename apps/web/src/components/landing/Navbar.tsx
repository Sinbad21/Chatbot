'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Globe } from 'lucide-react';
import { useLandingTranslation } from '@/hooks/useLandingTranslation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_OFFSET_PX = 80;

function scrollToHash(hash: string, retries = 8) {
  if (typeof window === 'undefined') return;

  const id = hash.replace(/^#/, '').trim();
  if (!id) return;

  const el = document.getElementById(id);
  if (!el) {
    if (retries > 0) {
      window.setTimeout(() => scrollToHash(hash, retries - 1), 50);
    }
    return;
  }

  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function Navbar() {
  const { t, lang, setLanguage } = useLandingTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Robust hash scrolling for Next.js (Link to /#section may update URL without scrolling)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onHashChange = () => {
      scrollToHash(window.location.hash);
    };

    // If the page loads with a hash, scroll once content is ready
    onHashChange();

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [pathname]);

  const navItems = [
    { label: t('nav.features'), href: '/#features' },
    { label: t('nav.pricing'), href: '/pricing' },
    { label: t('nav.docs'), href: '/docs' },
  ];

  const handleNav = (href: string, closeMobile?: boolean) => {
    if (closeMobile) setMobileMenuOpen(false);

    if (href.startsWith('/#')) {
      const hash = `#${href.split('#')[1] || ''}`;

      // If already on the landing page, update hash + scroll immediately.
      if (pathname === '/' && typeof window !== 'undefined') {
        // Avoid clobbering Next.js internal history.state (breaks back/forward).
          router.replace(href, { scroll: false });
        scrollToHash(hash);
        return;
      }

      // Otherwise navigate to landing with hash (scroll will occur via effect/hashchange)
      router.push(href);
      return;
    }

    router.push(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B4BFF] to-[#8B7FFF] flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#5B4BFF] to-[#8B7FFF] bg-clip-text text-transparent">
              OMNICAL STUDIO
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) =>
              item.href.startsWith('/#') ? (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNav(item.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase text-xs font-semibold">{lang}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setLanguage('en')}
                  className={lang === 'en' ? 'bg-accent' : ''}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLanguage('it')}
                  className={lang === 'it' ? 'bg-accent' : ''}
                >
                  Italiano
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/auth/login">
              <Button variant="ghost" size="sm">{t('nav.login')}</Button>
            </Link>

            <Link href="/auth/register">
              <Button size="sm" className="bg-[#5B4BFF] hover:bg-[#4B3BEF]">
                {t('nav.startFree')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) =>
                item.href.startsWith('/#') ? (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNav(item.href, true)}
                    className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ),
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLanguage('en');
                    setMobileMenuOpen(false);
                  }}
                  className={lang === 'en' ? 'bg-accent' : ''}
                >
                  EN
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLanguage('it');
                    setMobileMenuOpen(false);
                  }}
                  className={lang === 'it' ? 'bg-accent' : ''}
                >
                  IT
                </Button>
              </div>

              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  {t('nav.login')}
                </Button>
              </Link>

              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full bg-[#5B4BFF] hover:bg-[#4B3BEF]">
                  {t('nav.startFree')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
