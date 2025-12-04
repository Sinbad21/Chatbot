'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutGrid,
  Bot,
  MessageSquare,
  BarChart3,
  Users,
  Calendar,
  CalendarCheck,
  Globe,
  Puzzle,
  Settings,
  Menu,
  X,
  LogOut,
  Languages,
  Star,
} from 'lucide-react';
import { useTranslation, LANGUAGES, type Language } from '@/lib/i18n';
import { useSessionActivity } from '@/hooks/useSessionActivity';
import { SpaceBackground } from '@/components/dashboard/ui';
import { Command, Bell } from 'lucide-react';
import { logout } from '@/lib/authHeaders';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, currentLang, setLanguage } = useTranslation();

  // Monitora l'attività dell'utente per mantenere la sessione attiva
  useSessionActivity();

  const navigation = [
    { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutGrid },
    { nameKey: 'nav.bots', href: '/dashboard/bots', icon: Bot },
    { nameKey: 'nav.conversations', href: '/dashboard/conversations', icon: MessageSquare },
    { nameKey: 'nav.analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { nameKey: 'nav.reviewBot', href: '/dashboard/review-bot', icon: Star },
    { nameKey: 'nav.leads', href: '/dashboard/leads', icon: Users },
    { nameKey: 'nav.calendar', href: '/dashboard/calendar', icon: Calendar },
    { nameKey: 'nav.bookings', href: '/dashboard/bookings', icon: CalendarCheck },
    { nameKey: 'nav.scraping', href: '/dashboard/scraping', icon: Globe },
    { nameKey: 'nav.integrations', href: '/dashboard/integrations', icon: Puzzle },
    { nameKey: 'nav.settings', href: '/dashboard/settings', icon: Settings },
  ];
  const [userEmail, setUserEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    // Immediate auth check - runs on mount
    // Note: With httpOnly cookies, we can't check the token directly
    // We rely on the auth_session cookie and user data in localStorage
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      const authSession = document.cookie.includes('auth_session=true');

      if (!userStr || !authSession) {
        // Not authenticated - clear session cookie and redirect to login
        document.cookie = 'auth_session=; path=/; max-age=0';
        // Use replace to prevent back button access
        router.replace('/auth/login');
        return false;
      }

      try {
        const user = JSON.parse(userStr);
        setUserEmail(user.email || 'user@example.com');
        setIsAuthenticated(true);
        return true;
      } catch (e) {
        // Invalid user data - clear session cookie and redirect to login
        document.cookie = 'auth_session=; path=/; max-age=0';
        router.replace('/auth/login');
        return false;
      }
    };

    const isAuth = checkAuth();
    setLoading(false);

    if (!isAuth) {
      return; // Already redirecting
    }
  }, [router]);

  const handleLogout = () => {
    // Use the centralized logout function that clears httpOnly cookies via API
    logout();
  };

  // Show loading or nothing while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050014] flex items-center justify-center">
        <div className="text-purple-300/80">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Space Background */}
      <SpaceBackground />

      {/* Header */}
      <header className="relative z-40 bg-[#0a0510]/80 backdrop-blur-md border-b border-purple-500/10 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/60"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg bg-white text-black">
                  <Command size={16} />
                </div>
                <span className="font-serif font-bold text-lg tracking-wide text-white">Studio</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full cursor-pointer hover:bg-white/10">
                <Bell size={20} className="text-white/60" />
              </div>
              <span className="text-sm text-white/60 font-medium hidden sm:block">
                {userEmail}
              </span>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 text-sm text-white/40 hover:text-white font-medium p-2 rounded-lg hover:bg-white/10"
                  aria-label="Select Language"
                >
                  <Languages size={16} />
                  <span className="hidden sm:inline">{currentLang ? currentLang.toUpperCase() : 'EN'}</span>
                </button>

                {showLangMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowLangMenu(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-white/10 py-2 z-20 max-h-96 overflow-y-auto">
                      {Object.entries(LANGUAGES).map(([code, name]) => (
                        <button
                          key={code}
                          onClick={() => {
                            setLanguage(code as Language);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                            currentLang === code ? 'bg-white/10 text-white font-medium' : 'text-white/60'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 font-medium p-2 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="space-y-1 bg-gradient-to-b from-[#1a0b2e] to-[#0a0510] backdrop-blur-xl rounded-xl border border-purple-500/10 p-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                // Special case for dashboard: only active when pathname is exactly '/dashboard'
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.nameKey}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-900/50 to-transparent border-l-2 border-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.15)]'
                        : 'text-purple-300/60 hover:text-purple-100 hover:bg-purple-500/10'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{t(item.nameKey)}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Sidebar - Mobile */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/80"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-[#1a0b2e]/95 to-[#0a0510]/95 backdrop-blur-xl shadow-xl border-r border-purple-500/10">
                <div className="p-4 border-b border-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg bg-white text-black">
                        <Command size={16} />
                      </div>
                      <span className="font-serif font-bold text-lg tracking-wide text-white">Studio</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/60">
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <nav className="p-4 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    // Special case for dashboard: only active when pathname is exactly '/dashboard'
                    const isActive = item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.nameKey}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-900/50 to-transparent border-l-2 border-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.15)]'
                            : 'text-purple-300/60 hover:text-purple-100 hover:bg-purple-500/10'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{t(item.nameKey)}</span>
                      </Link>
                    );
                  })}
                </nav>
              </aside>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}