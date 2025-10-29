'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BotDetailClient() {
  const params = useParams();
  const router = useRouter();
  const botId = params.id as string;

  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (botId) {
      fetchBot();
    }
  }, [botId]);

  const fetchBot = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl || !token) {
        throw new Error('Configuration error. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/api/v1/bots/${botId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bot');
      }

      const data = await response.json();
      setBot(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bot');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-700">Loading bot...</div>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div>
        <div className="mb-8">
          <Link
            href="/dashboard/bots"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Bots
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Bot not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <Link
          href="/dashboard/bots"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Bots
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{bot.name}</h1>
            {bot.description && (
              <p className="text-gray-700">{bot.description}</p>
            )}
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              bot.published
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {bot.published ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            Edit Bot
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium">
            {bot.published ? 'Unpublish' : 'Publish'}
          </button>
          <button className="px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium">
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-800 font-medium mb-2">Conversations</div>
          <div className="text-3xl font-bold text-blue-600">{bot._count?.conversations || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-800 font-medium mb-2">Documents</div>
          <div className="text-3xl font-bold text-green-600">{bot._count?.documents || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-800 font-medium mb-2">Intents</div>
          <div className="text-3xl font-bold text-purple-600">{bot._count?.intents || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-800 font-medium mb-2">FAQs</div>
          <div className="text-3xl font-bold text-orange-600">{bot._count?.faqs || 0}</div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Configuration</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Welcome Message</label>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-900">
              {bot.welcomeMessage || 'No welcome message set'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">System Prompt</label>
            <div className="p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">
              {bot.systemPrompt || 'No system prompt set'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Bot Color</label>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-20 rounded-lg border border-gray-300"
                style={{ backgroundColor: bot.color || '#6366f1' }}
              />
              <span className="text-sm text-gray-900 font-mono">{bot.color || '#6366f1'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Widget Embed Code</label>
            <div className="p-4 bg-gray-900 rounded-lg text-green-400 font-mono text-sm overflow-x-auto">
              {`<script src="https://chatbot-widget.pages.dev/widget.js"></script>
<script>
  ChatbotWidget.init({
    botId: "${bot.id}",
    apiUrl: "${process.env.NEXT_PUBLIC_API_URL}"
  });
</script>`}
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Copy this code and paste it before the closing &lt;/body&gt; tag on your website
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
