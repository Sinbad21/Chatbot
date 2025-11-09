'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useTranslation } from '@/lib/i18n';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  score: number;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
  botId: string;
  botName: string;
  conversationId: string;
  messageCount: number;
  campaignId: string | null;
  campaignName: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface LeadDetail extends Lead {
  conversation: {
    id: string;
    botId: string;
    botName: string;
    messageCount: number;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }>;
  };
  campaign: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

type FilterStatus = 'all' | 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
type SortBy = 'recent' | 'oldest' | 'score-high' | 'score-low';

export default function LeadsClient() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('id');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    if (leadId) {
      loadLeadDetail(leadId);
    } else {
      loadLeads();
    }
  }, [leadId, filterStatus, sortBy, minScore]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError(t('leads.authTokenNotFound'));
        return;
      }

      const params = new URLSearchParams({
        status: filterStatus,
        sort: sortBy,
        search: searchQuery,
        minScore: minScore.toString(),
      });

      const response = await axios.get<Lead[]>(
        `${apiUrl}/api/v1/leads?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLeads(response.data);
    } catch (err: any) {
      console.error('Error loading leads:', err);
      setError(err.message || t('leads.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const loadLeadDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError(t('leads.authTokenNotFound'));
        return;
      }

      const response = await axios.get<LeadDetail>(
        `${apiUrl}/api/v1/leads/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedLead(response.data);
    } catch (err: any) {
      console.error('Error loading lead:', err);
      setError(err.message || t('leads.failedToLoadLead'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      await axios.patch(
        `${apiUrl}/api/v1/leads/${leadId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: t('leads.statusUpdated') });
      setTimeout(() => setMessage(null), 3000);

      // Reload data
      if (selectedLead) {
        loadLeadDetail(leadId);
      } else {
        loadLeads();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || t('leads.failedToUpdate') });
    }
  };

  const handleExportCSV = () => {
    const csvEscape = (v: unknown): string => {
      let s = v == null ? '' : String(v);
      s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const mustQuote = /[",\n]/.test(s);
      if (mustQuote) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

    const header = ['Name', 'Email', 'Phone', 'Company', 'Score', 'Status', 'Bot', 'Campaign', 'Created'];
    const rows = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.score,
      lead.status,
      lead.botName,
      lead.campaignName,
      new Date(lead.createdAt).toLocaleString(),
    ]);

    const csvContent = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-purple-100 text-purple-800';
      case 'QUALIFIED': return 'bg-yellow-100 text-yellow-800';
      case 'CONVERTED': return 'bg-green-100 text-green-800';
      case 'LOST': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="text-gray-600">{t('leads.loadingLeads')}</div>
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

  // Detail View
  if (leadId && selectedLead) {
    return (
      <div className="space-y-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/leads')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('leads.leadDetails')}</h1>
              <p className="text-sm text-gray-600 mt-1">{selectedLead.email || 'No email'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedLead.status}
              onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="NEW">{t('leads.new')}</option>
              <option value="CONTACTED">{t('leads.contacted')}</option>
              <option value="QUALIFIED">{t('leads.qualified')}</option>
              <option value="CONVERTED">{t('leads.converted')}</option>
              <option value="LOST">{t('leads.lost')}</option>
            </select>
          </div>
        </div>

        {/* Lead Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('leads.contactInformation')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">{t('leads.name')}</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{selectedLead.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('leads.email')}</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{selectedLead.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('leads.phone')}</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{selectedLead.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('leads.company')}</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{selectedLead.company || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('leads.leadScore')}</label>
              <p className={`text-2xl font-bold mt-1 ${getScoreColor(selectedLead.score)}`}>
                {selectedLead.score}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('conversations.status')}</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedLead.status)}`}>
                {selectedLead.status}
              </span>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('leads.bot')}</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{selectedLead.conversation.botName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('leads.campaign')}</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{selectedLead.campaign?.name || t('leads.none')}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">{t('leads.created')}</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{formatDate(selectedLead.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Conversation Transcript */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('leads.conversation').replace('{count}', selectedLead.conversation.messageCount.toString())}
          </h2>
          <div className="space-y-3">
            {selectedLead.conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.role === 'USER' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('leads.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('leads.subtitle').replace('{count}', leads.length.toString())}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={leads.length === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('leads.exportCSV')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={t('leads.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLeads()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">{t('leads.allStatus')}</option>
            <option value="NEW">{t('leads.new')}</option>
            <option value="CONTACTED">{t('leads.contacted')}</option>
            <option value="QUALIFIED">{t('leads.qualified')}</option>
            <option value="CONVERTED">{t('leads.converted')}</option>
            <option value="LOST">{t('leads.lost')}</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="recent">{t('leads.mostRecent')}</option>
            <option value="oldest">{t('leads.oldestFirst')}</option>
            <option value="score-high">{t('leads.highestScore')}</option>
            <option value="score-low">{t('leads.lowestScore')}</option>
          </select>
          <select
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="0">{t('leads.allScores')}</option>
            <option value="60">{t('leads.scoreGreaterThan60')}</option>
            <option value="80">{t('leads.scoreGreaterThan80')}</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">{t('leads.noLeads')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t('leads.name')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t('leads.email')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t('leads.bot')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t('leads.score')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t('conversations.status')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t('leads.created')}</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">{t('leads.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{lead.name || 'N/A'}</div>
                      {lead.company && <div className="text-xs text-gray-500">{lead.company}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{lead.email || 'N/A'}</div>
                      {lead.phone && <div className="text-xs text-gray-500">{lead.phone}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{lead.botName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{formatDate(lead.createdAt)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => router.push(`/dashboard/leads?id=${lead.id}`)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {t('dashboard.view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
