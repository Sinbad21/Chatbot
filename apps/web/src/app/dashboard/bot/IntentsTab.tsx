'use client';

import { useState, useEffect } from 'react';
import { buildAuthHeaders } from '@/lib/authHeaders';

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
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch intents');
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

    // Convert patterns text to array (split by newlines)
    const patterns = patternsText
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (patterns.length === 0) {
      setError('Please add at least one pattern');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/intents`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ name, patterns, response }),
      });

      if (!res.ok) {
        throw new Error('Failed to create intent');
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
    if (!confirm('Are you sure you want to delete this intent?')) {
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/intents/${intentId}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Failed to delete intent');
      }

      setIntents(intents.filter(intent => intent.id !== intentId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading intents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Intent Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Intent</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Intent Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., greeting, help_request, pricing_question"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="patterns" className="block text-sm font-medium text-gray-700 mb-1">
              Patterns (one per line)
            </label>
            <textarea
              id="patterns"
              value={patternsText}
              onChange={(e) => setPatternsText(e.target.value)}
              placeholder="hello&#10;hi&#10;hey there&#10;good morning"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Add phrases that trigger this intent, one per line
            </p>
          </div>

          <div>
            <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-1">
              Response
            </label>
            <textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Hello! How can I help you today?"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Adding...' : 'Add Intent'}
          </button>
        </form>
      </div>

      {/* Intents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Intents ({intents.length})
        </h3>

        {intents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No intents yet. Add your first intent above to train your bot with pattern matching.
          </p>
        ) : (
          <div className="space-y-4">
            {intents.map((intent) => (
              <div
                key={intent.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{intent.name}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(intent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(intent.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Patterns:</p>
                  <div className="flex flex-wrap gap-1">
                    {intent.patterns.map((pattern, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-mono"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Response:</p>
                  <p className="text-sm text-gray-600">{intent.response}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
