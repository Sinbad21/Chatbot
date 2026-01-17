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
        if (data.upgradeRequired) {
          throw new Error(data.message || t('createBot.botLimitReached'));
        }
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
          className="text-sm text-charcoal hover:text-charcoal font-medium transition-colors"
        >
          {t('createBot.backToBots')}
        </Link>
      </div>

      <div className="glass-effect border border-silver-200/70 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-charcoal mb-2">{t('createBot.title')}</h1>
        <p className="text-silver-600 mb-8">
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
            <label htmlFor="name" className="block text-sm font-medium text-silver-600 mb-2">
              {t('createBot.botName')}
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-pearl-50 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/30 focus:border-emerald/40 text-charcoal placeholder-white/40 transition-all"
              placeholder={t('createBot.botNamePlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-silver-600 mb-2">
              {t('createBot.description')}
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-pearl-50 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/30 focus:border-emerald/40 text-charcoal placeholder-white/40 transition-all"
              placeholder={t('createBot.descriptionPlaceholder')}
            />
          </div>

          {/* Welcome Message */}
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-silver-600 mb-2">
              {t('createBot.welcomeMessage')}
            </label>
            <textarea
              id="welcomeMessage"
              rows={2}
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              className="w-full px-4 py-3 bg-pearl-50 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/30 focus:border-emerald/40 text-charcoal placeholder-white/40 transition-all"
              placeholder={t('createBot.welcomeMessagePlaceholder')}
            />
            <p className="text-sm text-silver-600 mt-1">
              {t('createBot.welcomeMessageHelp')}
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-silver-600 mb-2">
              {t('createBot.systemPrompt')}
            </label>
            <textarea
              id="systemPrompt"
              rows={4}
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              className="w-full px-4 py-3 bg-pearl-50 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/30 focus:border-emerald/40 text-charcoal placeholder-white/40 transition-all"
              placeholder={t('createBot.systemPromptPlaceholder')}
            />
            <p className="text-sm text-silver-600 mt-1">
              {t('createBot.systemPromptHelp')}
            </p>
          </div>

          {/* Bot Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-silver-600 mb-2">
              {t('createBot.botColor')}
            </label>
            <div className="flex items-center gap-4">
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-12 w-20 border border-silver-200/70 rounded-lg cursor-pointer bg-pearl-50"
              />
              <span className="text-sm text-silver-600">{formData.color}</span>
            </div>
            <p className="text-sm text-silver-600 mt-1">
              {t('createBot.colorWillBeUsed')}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-charcoal text-charcoal rounded-lg hover:bg-charcoal/90 font-medium transition-all shadow-lg  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('createBot.creating') : t('createBot.createBot')}
            </button>
            <Link
              href="/dashboard/bots"
              className="px-6 py-3 border border-silver-200/70 text-silver-700 rounded-lg hover:bg-pearl-100/60 font-medium text-center transition-all"
            >
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

