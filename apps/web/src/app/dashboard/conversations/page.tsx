'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  botId: string;
  botName: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'abandoned';
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    duration?: string;
    leadCaptured?: boolean;
  };
}

interface ConversationListItem {
  id: string;
  botName: string;
  messageCount: number;
  lastMessage: string;
  createdAt: string;
  status: 'active' | 'completed' | 'abandoned';
}

type FilterStatus = 'all' | 'active' | 'completed' | 'abandoned';
type SortBy = 'recent' | 'oldest' | 'messages';

export default function ConversationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');

  useEffect(() => {
    if (conversationId) {
      loadConversationDetail(conversationId);
    } else {
      loadConversations();
    }
  }, [conversationId, filterStatus, sortBy, searchQuery]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Load conversations from API
      const response = await axios.get<ConversationListItem[]>(
        `${apiUrl}/api/v1/conversations?status=${filterStatus}&sort=${sortBy}&search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setConversations(response.data);
    } catch (err: any) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      // Load conversation detail from API
      const response = await axios.get<ConversationDetail>(
        `${apiUrl}/api/v1/conversations/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedConversation(response.data);
    } catch (err: any) {
      console.error('Error loading conversation:', err);
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleExportConversation = (conversation: ConversationDetail) => {
    // Create transcript text
    const transcript = conversation.messages
      .map(msg => {
        const timestamp = new Date(msg.createdAt).toLocaleString();
        const role = msg.role === 'user' ? 'User' : conversation.botName;
        return `[${timestamp}] ${role}:\n${msg.content}\n`;
      })
      .join('\n');

    const metadata = `
Conversation ID: ${conversation.id}
Bot: ${conversation.botName}
Status: ${conversation.status}
Started: ${new Date(conversation.createdAt).toLocaleString()}
Ended: ${new Date(conversation.updatedAt).toLocaleString()}
Duration: ${conversation.metadata?.duration || 'N/A'}
Total Messages: ${conversation.messages.length}

-----------------------------------
TRANSCRIPT
-----------------------------------

${transcript}
    `;

    const blob = new Blob([metadata], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `conversation_${conversation.id}_${Date.now()}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search is now handled by the backend, no need to filter here
  const filteredConversations = conversations;

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
        <div className="text-gray-600">Loading conversations...</div>
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
  if (conversationId && selectedConversation) {
    return (
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/conversations')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Conversation Details</h1>
              <p className="text-sm text-gray-600 mt-1">View full transcript and metadata</p>
            </div>
          </div>
          <button
            onClick={() => handleExportConversation(selectedConversation)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            Export Transcript
          </button>
        </div>

        {/* Metadata Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Bot Name</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{selectedConversation.botName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Status</label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedConversation.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : selectedConversation.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {selectedConversation.status}
              </span>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Duration</label>
              <p className="text-sm text-gray-900 font-medium mt-1">
                {selectedConversation.metadata?.duration || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Messages</label>
              <p className="text-sm text-gray-900 font-medium mt-1">{selectedConversation.messages.length}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Started</label>
              <p className="text-sm text-gray-900 font-medium mt-1">
                {new Date(selectedConversation.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Ended</label>
              <p className="text-sm text-gray-900 font-medium mt-1">
                {new Date(selectedConversation.updatedAt).toLocaleString()}
              </p>
            </div>
            {selectedConversation.metadata?.leadCaptured !== undefined && (
              <div>
                <label className="text-xs font-medium text-gray-600">Lead Captured</label>
                <p className="text-sm text-gray-900 font-medium mt-1">
                  {selectedConversation.metadata.leadCaptured ? '✓ Yes' : '✗ No'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h2>
          <div className="space-y-4">
            {selectedConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {message.role === 'user' ? 'User' : selectedConversation.botName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage all bot conversations
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="messages">Most Messages</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => router.push(`/dashboard/conversations?id=${conv.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{conv.botName}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        conv.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : conv.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 truncate">{conv.lastMessage}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{conv.messageCount} messages</span>
                    <span>•</span>
                    <span>{formatDate(conv.createdAt)}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
