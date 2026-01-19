'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { buildAuthHeaders } from '@/lib/authHeaders';
import { GlassCard } from '@/components/dashboard/ui';

interface Intent {
  id: string;
  name: string;
  patterns: string[];
  response: string;
  createdAt: string;
}

interface IntentsTabProps {
  botId: string;
  apiBaseUrl: string;
}

export default function IntentsTab({ botId, apiBaseUrl }: IntentsTabProps) {
  const t = useTranslations('intents');
  const tCommon = useTranslations('common');
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [patternsText, setPatternsText] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchIntents();
  }, [botId]);

  const fetchIntents = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/intents`, {
        credentials: 'include',
        headers: buildAuthHeaders(false),
      });

      if (!response.ok) {
        throw new Error(t('error'));
      }

      const data = await response.json();
      setIntents(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !patternsText.trim() || !response.trim()) {
      return;
    }

    const patterns = patternsText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (patterns.length === 0) {
      setError(t('atLeastOnePattern'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/intents`, {
        credentials: 'include',
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ name, patterns, response }),
      });

      if (!res.ok) {
        throw new Error(t('failedToAdd'));
      }

      const newIntent = await res.json();
      setIntents([newIntent, ...intents]);
      setName('');
      setPatternsText('');
      setResponse('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (intentId: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/intents/${intentId}`, {
        credentials: 'include',
        method: 'DELETE',
        headers: buildAuthHeaders(false),
      });

      if (!res.ok) {
        throw new Error(t('failedToDelete'));
      }

      setIntents(intents.filter(intent => intent.id !== intentId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-silver-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">{t('title')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-silver-600 mb-1">
              {t('intentName')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('intentNamePlaceholder')}
              className="w-full px-4 py-2 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/20 focus:border-transparent text-charcoal placeholder:text-silver-400 bg-pearl-50"
              required
            />
          </div>

          <div>
            <label htmlFor="patterns" className="block text-sm font-medium text-silver-600 mb-1">
              {t('patterns')}
            </label>
            <textarea
              id="patterns"
              value={patternsText}
              onChange={(e) => setPatternsText(e.target.value)}
              placeholder={t('patternsPlaceholder')}
              rows={5}
              className="w-full px-4 py-2 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/20 focus:border-transparent resize-none font-mono text-sm text-charcoal placeholder:text-silver-400 bg-pearl-50"
              required
            />
            <p className="text-xs text-silver-500 mt-1">{t('patternsHelp')}</p>
          </div>

          <div>
            <label htmlFor="response" className="block text-sm font-medium text-silver-600 mb-1">
              {t('response')}
            </label>
            <textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={t('responsePlaceholder')}
              rows={4}
              className="w-full px-4 py-2 border border-silver-200/70 rounded-lg focus:ring-2 focus:ring-emerald/20 focus:border-transparent resize-none text-charcoal placeholder:text-silver-400 bg-pearl-50"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? t('adding') : t('addIntent')}
          </button>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">
          {`${t('intentsCount')} (${intents.length})`}
        </h3>

        {intents.length === 0 ? (
          <p className="text-silver-500 text-center py-8">{t('noIntents')}</p>
        ) : (
          <div className="space-y-4">
            {intents.map((intent) => (
              <div
                key={intent.id}
                className="border border-silver-200/70 rounded-lg p-4 hover:border-emerald/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-charcoal">{intent.name}</h4>
                    <span className="text-xs text-silver-500">
                      {new Date(intent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(intent.id)}
                    className="text-red-600 hover:text-red-400 text-sm font-medium"
                  >
                    {tCommon('delete')}
                  </button>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-medium text-silver-600 mb-1">{t('patterns')}:</p>
                  <div className="flex flex-wrap gap-1">
                    {intent.patterns.map((pattern, idx) => (
                      <span
                        key={idx}
                        className="bg-pearl-100/60 text-charcoal px-2 py-1 rounded text-xs font-mono"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-silver-600 mb-1">{t('response')}:</p>
                  <p className="text-sm text-silver-600">{intent.response}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}