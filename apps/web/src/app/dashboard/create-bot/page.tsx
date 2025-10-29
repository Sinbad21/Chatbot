'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewBotPage() {
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
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl || !token) {
        throw new Error('Configuration error. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/api/v1/bots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create bot');
      }

      const bot = await response.json();
      router.push(`/dashboard/bots/${bot.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/dashboard/bots"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Bots
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Bot</h1>
        <p className="text-gray-700 mb-8">
          Set up your chatbot with a name, description, and customize its behavior
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bot Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              Bot Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Customer Support Bot"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Briefly describe what this bot does..."
            />
          </div>

          {/* Welcome Message */}
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-900 mb-2">
              Welcome Message
            </label>
            <textarea
              id="welcomeMessage"
              rows={2}
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="First message users see..."
            />
            <p className="text-sm text-gray-700 mt-1">
              This is the first message users will see when they start a conversation
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-900 mb-2">
              System Prompt
            </label>
            <textarea
              id="systemPrompt"
              rows={4}
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Instructions for the AI..."
            />
            <p className="text-sm text-gray-700 mt-1">
              Define how your bot should behave and respond to users
            </p>
          </div>

          {/* Bot Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-900 mb-2">
              Bot Color
            </label>
            <div className="flex items-center gap-4">
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
              />
              <span className="text-sm text-gray-700">{formData.color}</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">
              This color will be used for the chat widget
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Bot'}
            </button>
            <Link
              href="/dashboard/bots"
              className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
