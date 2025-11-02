'use client';

import { useState, useEffect } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  createdAt: string;
}

interface FAQsTabProps {
  botId: string;
}

export default function FAQsTab({ botId }: FAQsTabProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchFAQs();
  }, [botId]);

  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/v1/bots/${botId}/faqs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }

      const data = await response.json();
      setFaqs(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${apiUrl}/api/v1/bots/${botId}/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          answer,
          category: category.trim() || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create FAQ');
      }

      const newFAQ = await res.json();
      setFaqs([newFAQ, ...faqs]);
      setQuestion('');
      setAnswer('');
      setCategory('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${apiUrl}/api/v1/faqs/${faqId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete FAQ');
      }

      setFaqs(faqs.filter(faq => faq.id !== faqId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    const cat = faq.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add FAQ Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New FAQ</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What are your business hours?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="We're open Monday to Friday, 9 AM to 5 PM EST."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category (optional)
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., General, Pricing, Support"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            {submitting ? 'Adding...' : 'Add FAQ'}
          </button>
        </form>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          FAQs ({faqs.length})
        </h3>

        {faqs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No FAQs yet. Add your first FAQ above to provide quick answers to common questions.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFAQs).map(([categoryName, categoryFaqs]) => (
              <div key={categoryName}>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                    {categoryName}
                  </span>
                  <span className="text-xs text-gray-500">({categoryFaqs.length})</span>
                </h4>
                <div className="space-y-3">
                  {categoryFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">Q: {faq.question}</h5>
                          <span className="text-xs text-gray-500">
                            {new Date(faq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">A:</span> {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
