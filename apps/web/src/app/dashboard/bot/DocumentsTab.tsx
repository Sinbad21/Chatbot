'use client';

import { useState, useEffect } from 'react';
import { buildAuthHeaders } from '@/lib/authHeaders';

interface Document {
  id: string;
  name: string;
  content: string;
  status: string;
  createdAt: string;
}

interface DocumentsTabProps {
  botId: string;
  apiBaseUrl: string;
}

export default function DocumentsTab({ botId, apiBaseUrl }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [botId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/documents`, {
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !content.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/documents`, {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ name, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDocument = await response.json();
      setDocuments([newDocument, ...documents]);
      setName('');
      setContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/documents/${documentId}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Document Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Document</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Document Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Guide, FAQ Document"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your document content here..."
              rows={8}
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
            {submitting ? 'Adding...' : 'Add Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No documents yet. Add your first document above to train your bot.
          </p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{doc.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
