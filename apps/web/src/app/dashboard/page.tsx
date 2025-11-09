'use client';

import { useTranslation } from '@/lib/i18n';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('dashboard.title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow min-w-0">
          <div className="text-sm text-gray-800 font-medium mb-2">{t('dashboard.stats.totalBots')}</div>
          <div className="text-3xl font-bold text-indigo-600 truncate">5</div>
          <div className="text-xs text-green-600 font-medium mt-1">{t('dashboard.growth.thisMonth').replace('{count}', '2')}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow min-w-0">
          <div className="text-sm text-gray-800 font-medium mb-2">{t('dashboard.stats.conversations')}</div>
          <div className="text-3xl font-bold text-blue-600 truncate">1,234</div>
          <div className="text-xs text-green-600 font-medium mt-1">{t('dashboard.growth.vsLastMonth').replace('{percent}', '15')}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow min-w-0">
          <div className="text-sm text-gray-800 font-medium mb-2">{t('dashboard.stats.leadsCaptured')}</div>
          <div className="text-3xl font-bold text-green-600 truncate">89</div>
          <div className="text-xs text-green-600 font-medium mt-1">{t('dashboard.growth.vsLastMonth').replace('{percent}', '23')}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow min-w-0">
          <div className="text-sm text-gray-800 font-medium mb-2">{t('dashboard.stats.activeUsers')}</div>
          <div className="text-3xl font-bold text-purple-600 truncate">456</div>
          <div className="text-xs text-green-600 font-medium mt-1">{t('dashboard.growth.vsLastMonth').replace('{percent}', '8')}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.recentBots')}</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{t('dashboard.customerSupportBot').replace('{number}', i.toString())}</h3>
                <p className="text-sm text-gray-700">{t('dashboard.lastActive').replace('{time}', t('dashboard.hours').replace('{count}', '2'))}</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                {t('dashboard.view')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
