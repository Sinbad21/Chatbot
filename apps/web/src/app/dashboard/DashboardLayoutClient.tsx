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
  Globe,
  Puzzle,
  Settings,
  Menu,
  X,
  LogOut,
  Languages,
} from 'lucide-react';
import { useTranslation, LANGUAGES, type Language } from '@/lib/i18n';
import { useSessionActivity } from '@/hooks/useSessionActivity';

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
    { nameKey: 'nav.leads', href: '/dashboard/leads', icon: Users },
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
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Remove auth session cookies
    document.cookie = 'auth_session=; path=/; max-age=0';
    document.cookie = 'last_activity=; path=/; max-age=0';

    router.push('/auth/login');
  };

  // Show loading or nothing while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="text-2xl font-bold text-indigo-600">Chatbot Studio</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-900 font-medium hidden sm:block">
                {userEmail}
              </span>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium p-2 rounded-lg hover:bg-gray-100"
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto">
                      {Object.entries(LANGUAGES).map(([code, name]) => (
                        <button
                          key={code}
                          onClick={() => {
                            setLanguage(code as Language);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            currentLang === code ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
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
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="space-y-1 bg-white rounded-lg shadow-sm p-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.nameKey}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <Icon size={20} />
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
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">Menu</h2>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <nav className="p-4 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.nameKey}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100 font-medium'
                        }`}
                      >
                        <Icon size={20} />
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
