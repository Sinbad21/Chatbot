'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsOverview {
  conversations: number;
  messages: number;
  leads: number;
}

interface ConversationData {
  date: string;
  conversations: number;
}

interface IntentData {
  name: string;
  count: number;
}

interface Conversation {
  id: string;
  botName: string;
  messageCount: number;
  lastMessage: string;
  duration: string;
  createdAt: string;
  status: 'active' | 'completed' | 'abandoned';
}

type DateRange = '7d' | '30d' | '90d' | 'all';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [conversationsData, setConversationsData] = useState<ConversationData[]>([]);
  const [intentsData, setIntentsData] = useState<IntentData[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Load all analytics data in parallel
      const [overviewResponse, conversationsDataResponse, intentsDataResponse, conversationsListResponse] =
        await Promise.all([
          axios.get<AnalyticsOverview>(`${apiUrl}/api/v1/analytics/overview`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<ConversationData[]>(
            `${apiUrl}/api/v1/analytics/conversations-over-time?range=${dateRange}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get<IntentData[]>(`${apiUrl}/api/v1/analytics/top-intents?range=${dateRange}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<Conversation[]>(`${apiUrl}/api/v1/conversations?sort=recent&status=all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setOverview(overviewResponse.data);
      setConversationsData(conversationsDataResponse.data);
      setIntentsData(intentsDataResponse.data);
      setConversations(conversationsListResponse.data.slice(0, 5)); // Show only top 5
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // CSV helper functions with RFC-compliant escaping
  const csvEscape = (v: unknown): string => {
    let s = v == null ? '' : String(v);
    // Replace CR/LF with \n for uniform lines
    s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const mustQuote = /[",\n]/.test(s);
    if (mustQuote) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const downloadCsv = (filename: string, rows: (string | number | null | undefined)[][]) => {
    const csvRows = rows.map(r => r.map(csvEscape));
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    // Prepare CSV data with proper typing
    const header = ['Date', 'Bot Name', 'Messages', 'Duration', 'Status'];
    const rows = conversations.map(conv => [
      new Date(conv.createdAt).toLocaleString(),
      conv.botName,
      conv.messageCount,
      conv.duration,
      conv.status,
    ]);

    downloadCsv(`conversations_${dateRange}_${Date.now()}`, [header, ...rows]);
  };

  const filteredConversations = conversations.filter(conv =>
    searchQuery === '' ||
    conv.botName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your chatbot performance and user interactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Conversations</h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {overview?.conversations.toLocaleString() || 0}
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 12% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Messages</h3>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {overview?.messages.toLocaleString() || 0}
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 8% from last period</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Leads</h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {overview?.leads.toLocaleString() || 0}
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 24% from last period</p>
        </div>
      </div>

      {/* Conversations Over Time Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversations Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={conversationsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="conversations"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ fill: '#4f46e5', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Intents Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Intents</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={intentsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Conversations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
          <input
            type="text"
            placeholder="Search by bot or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Bot Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Messages
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 text-sm">
                    No conversations found
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{conv.botName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{conv.messageCount}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{conv.duration}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          conv.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : conv.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {conv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{formatDate(conv.createdAt)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
