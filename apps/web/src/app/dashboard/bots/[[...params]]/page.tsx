'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Bot {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  systemPrompt: string;
  welcomeMessage: string;
  color: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    conversations: number;
    documents: number;
    intents: number;
    faqs: number;
  };
}

export default function BotsPage() {
  const params = useParams<{ params?: string[] }>();
  const router = useRouter();

  // Extract bot ID from params if present
  // params.params will be undefined (list view) or ['bot-id'] (detail view)
  const botId = params.params?.[0] || null;

  const [bots, setBots] = useState<Bot[]>([]);
  const [currentBot, setCurrentBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (botId) {
      fetchBotDetail(botId);
    } else {
      fetchBots();
    }
  }, [botId]);

  const fetchBots = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl || !token) {
        setError('Configuration error. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/v1/bots`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bots');
      }

      const data = await response.json();
      setBots(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  const fetchBotDetail = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${apiUrl}/api/v1/bots/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bot');
      }

      const data = await response.json();
      setCurrentBot(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bot');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!currentBot) return;

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/api/v1/bots/${currentBot.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !currentBot.published }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bot');
      }

      setCurrentBot({ ...currentBot, published: !currentBot.published });
    } catch (err: any) {
      setError(err.message || 'Failed to update bot');
    }
  };

  const handleDelete = async () => {
    if (!currentBot || !confirm(`Are you sure you want to delete "${currentBot.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/api/v1/bots/${currentBot.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete bot');
      }

      router.push('/dashboard/bots');
    } catch (err: any) {
      setError(err.message || 'Failed to delete bot');
    }
  };

  // Show bot detail view if botId is present
  if (botId) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-800 font-medium">Loading...</div>
        </div>
      );
    }

    if (error || !currentBot) {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 font-medium mb-4">{error || 'Bot not found'}</div>
          <button
            onClick={() => router.push('/dashboard/bots')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Back to Bots
          </button>
        </div>
      );
    }

    const widgetCode = `<script src="https://chatbot-studio.pages.dev/widget.js"></script>
<script>
  ChatbotWidget.init({
    botId: '${currentBot.id}',
    apiUrl: '${process.env.NEXT_PUBLIC_API_URL}'
  });
</script>`;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{currentBot.name}</h1>
                {currentBot.published ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    Published
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                    Draft
                  </span>
                )}
              </div>
              {currentBot.description && (
                <p className="text-gray-800 mb-4">{currentBot.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push(`/dashboard/bots/${currentBot.id}/edit`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={handlePublishToggle}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
                >
                  {currentBot.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => router.push('/dashboard/bots')}
                  className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-800 font-medium mb-2">Conversations</div>
            <div className="text-3xl font-bold text-indigo-600">{currentBot._count.conversations}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-800 font-medium mb-2">Documents</div>
            <div className="text-3xl font-bold text-indigo-600">{currentBot._count.documents}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-800 font-medium mb-2">Intents</div>
            <div className="text-3xl font-bold text-indigo-600">{currentBot._count.intents}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-800 font-medium mb-2">FAQs</div>
            <div className="text-3xl font-bold text-indigo-600">{currentBot._count.faqs}</div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Theme Color</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: currentBot.color }}
                />
                <span className="text-gray-900 font-mono font-medium">{currentBot.color}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Welcome Message</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-medium">{currentBot.welcomeMessage}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">System Prompt</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-medium whitespace-pre-wrap">
                {currentBot.systemPrompt}
              </p>
            </div>
          </div>
        </div>

        {/* Widget Embed Code */}
        {currentBot.published && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Widget Embed Code</h2>
            <p className="text-gray-800 mb-3 font-medium">
              Copy this code and paste it before the closing &lt;/body&gt; tag on your website:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono">{widgetCode}</pre>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(widgetCode);
                alert('Widget code copied to clipboard!');
              }}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Copy Code
            </button>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Metadata</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Bot ID:</span>
              <span className="text-gray-900 font-mono text-sm font-medium">{currentBot.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Created:</span>
              <span className="text-gray-900 font-medium">
                {new Date(currentBot.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-800 font-medium">Last Updated:</span>
              <span className="text-gray-900 font-medium">
                {new Date(currentBot.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show bots list view
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bots</h1>
        <Link
          href="/dashboard/create-bot"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          Create New Bot
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-700">Loading bots...</div>
        </div>
      ) : bots.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bots yet</h3>
          <p className="text-gray-700 mb-6">
            Get started by creating your first chatbot
          </p>
          <Link
            href="/dashboard/create-bot"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Create Your First Bot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div key={bot.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{bot.name}</h3>
                  <p className="text-sm text-gray-700 line-clamp-2">{bot.description}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bot.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {bot.published ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
                <div>
                  <span className="font-medium">{bot._count?.conversations || 0}</span> conversations
                </div>
                <div>
                  <span className="font-medium">{bot._count?.documents || 0}</span> documents
                </div>
              </div>

              <Link
                href={`/dashboard/bots/${bot.id}`}
                className="block w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 font-medium"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
