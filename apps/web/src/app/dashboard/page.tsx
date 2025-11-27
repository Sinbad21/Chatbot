'use client';

import { useTranslation } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  totalBots: number;
  botsThisMonth: number;
  conversations: number;
  conversationsGrowth: number;
  leads: number;
  leadsGrowth: number;
  activeUsers: number;
  activeUsersGrowth: number;
}

interface RecentBot {
  id: string;
  name: string;
  description: string | null;
  lastActive: string;
  lastActiveDate: string;
  conversationCount: number;
  isPublished: boolean;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentBots, setRecentBots] = useState<RecentBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Fetch analytics overview
        const analyticsResponse = await fetch(`${apiUrl}/api/v1/analytics/overview`, { headers });
        if (!analyticsResponse.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);

        // Fetch recent bots
        const botsResponse = await fetch(`${apiUrl}/api/v1/analytics/recent-bots?limit=3`, { headers });
        if (!botsResponse.ok) {
          throw new Error('Failed to fetch recent bots');
        }
        const botsData = await botsResponse.json();
        setRecentBots(botsData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4"></div>
          <p className="text-purple-300/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 backdrop-blur-md border border-red-500/30 rounded-2xl p-6">
        <h2 className="text-red-400 font-semibold mb-2">Error Loading Dashboard</h2>
        <p className="text-red-300/70">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const sign = isPositive ? '+' : '';
    return { text: `${sign}${growth}%`, color };
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">{t('dashboard.title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl min-w-0">
          <div className="text-sm text-purple-300/70 font-medium mb-2">{t('dashboard.stats.totalBots')}</div>
          <div className="text-3xl font-bold text-fuchsia-400 truncate">{analytics.totalBots}</div>
          <div className="text-xs text-fuchsia-400/70 font-medium mt-1">
            {t('dashboard.growth.thisMonth').replace('{count}', analytics.botsThisMonth.toString())}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl min-w-0">
          <div className="text-sm text-purple-300/70 font-medium mb-2">{t('dashboard.stats.conversations')}</div>
          <div className="text-3xl font-bold text-purple-400 truncate">{analytics.conversations.toLocaleString()}</div>
          <div className={`text-xs font-medium mt-1 ${formatGrowth(analytics.conversationsGrowth).color}`}>
            {formatGrowth(analytics.conversationsGrowth).text} vs last month
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl min-w-0">
          <div className="text-sm text-purple-300/70 font-medium mb-2">{t('dashboard.stats.leadsCaptured')}</div>
          <div className="text-3xl font-bold text-emerald-400 truncate">{analytics.leads}</div>
          <div className={`text-xs font-medium mt-1 ${formatGrowth(analytics.leadsGrowth).color}`}>
            {formatGrowth(analytics.leadsGrowth).text} vs last month
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl min-w-0">
          <div className="text-sm text-purple-300/70 font-medium mb-2">{t('dashboard.stats.activeUsers')}</div>
          <div className="text-3xl font-bold text-fuchsia-400 truncate">{analytics.activeUsers}</div>
          <div className={`text-xs font-medium mt-1 ${formatGrowth(analytics.activeUsersGrowth).color}`}>
            {formatGrowth(analytics.activeUsersGrowth).text} vs last month
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.recentBots')}</h2>
        {recentBots.length === 0 ? (
          <p className="text-purple-300/70 text-center py-8">
            No bots yet. Create your first bot to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {recentBots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between border-b border-purple-500/20 pb-4 last:border-b-0">
                <div>
                  <h3 className="font-semibold text-white">{bot.name}</h3>
                  <p className="text-sm text-purple-300/70">
                    Last active: {bot.lastActive} • {bot.conversationCount} conversation{bot.conversationCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 font-medium transition-all shadow-lg shadow-purple-500/25"
                >
                  {t('dashboard.view')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
