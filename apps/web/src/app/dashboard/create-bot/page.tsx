'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function NewBotPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: 'You are a helpful AI assistant.',
    welcomeMessage: 'Hello! How can I help you today?',
    color: '#6366f1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(t('createBot.configError'));
      }

      const response = await fetch(`${apiUrl}/api/v1/bots`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('createBot.failedToCreate'));
      }

      const bot = await response.json();
      // Redirect to bots list (detail page temporarily disabled due to Next.js static export limitations)
      router.push('/dashboard/bots');
    } catch (err: any) {
      setError(err.message || t('createBot.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/dashboard/bots"
          className="text-sm text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors"
        >
          {t('createBot.backToBots')}
        </Link>
      </div>

      <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('createBot.title')}</h1>
        <p className="text-white/70 mb-8">
          {t('createBot.subtitle')}
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bot Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
              {t('createBot.botName')}
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-white/40 transition-all"
              placeholder={t('createBot.botNamePlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-2">
              {t('createBot.description')}
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-white/40 transition-all"
              placeholder={t('createBot.descriptionPlaceholder')}
            />
          </div>

          {/* Welcome Message */}
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-white/70 mb-2">
              {t('createBot.welcomeMessage')}
            </label>
            <textarea
              id="welcomeMessage"
              rows={2}
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-white/40 transition-all"
              placeholder={t('createBot.welcomeMessagePlaceholder')}
            />
            <p className="text-sm text-white/60 mt-1">
              {t('createBot.welcomeMessageHelp')}
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-white/70 mb-2">
              {t('createBot.systemPrompt')}
            </label>
            <textarea
              id="systemPrompt"
              rows={4}
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-white/40 transition-all"
              placeholder={t('createBot.systemPromptPlaceholder')}
            />
            <p className="text-sm text-white/60 mt-1">
              {t('createBot.systemPromptHelp')}
            </p>
          </div>

          {/* Bot Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-white/70 mb-2">
              {t('createBot.botColor')}
            </label>
            <div className="flex items-center gap-4">
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-12 w-20 border border-purple-500/30 rounded-lg cursor-pointer bg-purple-900/30"
              />
              <span className="text-sm text-white/70">{formData.color}</span>
            </div>
            <p className="text-sm text-white/60 mt-1">
              {t('createBot.colorWillBeUsed')}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('createBot.creating') : t('createBot.createBot')}
            </button>
            <Link
              href="/dashboard/bots"
              className="px-6 py-3 border border-purple-500/30 text-white/80 rounded-lg hover:bg-purple-500/10 font-medium text-center transition-all"
            >
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

