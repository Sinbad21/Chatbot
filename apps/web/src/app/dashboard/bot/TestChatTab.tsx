'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUp, Settings, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TestChatTabProps {
  botId: string;
  apiBaseUrl: string;
}

const PROMPT_TEMPLATES = [
  {
    name: 'Customer Support',
    prompt: 'You are a helpful customer support assistant. Be professional, empathetic, and provide clear solutions to customer problems. Always ask follow-up questions to better understand the issue.'
  },
  {
    name: 'Sales Assistant',
    prompt: 'You are a knowledgeable sales assistant. Help customers find the right products, answer questions about features and pricing, and guide them through the purchase process. Be persuasive but not pushy.'
  },
  {
    name: 'Technical Expert',
    prompt: 'You are a technical expert with deep knowledge of software and systems. Provide detailed technical explanations, troubleshooting steps, and best practices. Use technical terminology when appropriate.'
  },
  {
    name: 'Friendly Chatbot',
    prompt: 'You are a friendly and conversational AI assistant. Use a warm, approachable tone and emojis when appropriate. Keep responses concise and engaging.'
  },
  {
    name: 'Professional Advisor',
    prompt: 'You are a professional advisor providing expert guidance. Be formal, precise, and data-driven in your responses. Cite sources when possible and acknowledge limitations.'
  },
];

export default function TestChatTab({ botId, apiBaseUrl }: TestChatTabProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`test-${Date.now()}`);
  const [botName, setBotName] = useState('Bot');
  const [botLogoUrl, setBotLogoUrl] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch bot details to get logo and system prompt
    const fetchBotDetails = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const bot = await response.json();
          if (bot.name) setBotName(bot.name);
          if (bot.logoUrl) setBotLogoUrl(bot.logoUrl);
          if (bot.systemPrompt) {
            setSystemPrompt(bot.systemPrompt);
            setEditedPrompt(bot.systemPrompt);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bot details:', err);
      }
    };

    fetchBotDetails();
  }, [botId, apiBaseUrl]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          message: userMessage.content,
          sessionId,
          metadata: { source: 'test-tab' },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.botName && botName === 'Bot') {
        setBotName(data.botName);
      }

      const botMessage: Message = {
        role: 'assistant',
        content: data.message || t('bot.test.noResponse'),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: t('bot.test.errorMessage').replace('{message}', error.message),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const applyPrompt = async () => {
    if (isSavingPrompt || editedPrompt.trim() === systemPrompt) return;

    setIsSavingPrompt(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ systemPrompt: editedPrompt.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update prompt (${response.status})`);
      }

      setSystemPrompt(editedPrompt.trim());
      setIsEditingPrompt(false);
    } catch (error: any) {
      console.error('Error updating prompt:', error);
      alert(t('bot.test.failedToUpdate').replace('{message}', error.message));
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const applyTemplate = (template: typeof PROMPT_TEMPLATES[0]) => {
    setEditedPrompt(template.prompt);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-4">
      {/* Prompt Editor */}
      <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-sm border border-white/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-white/60" />
            <h3 className="text-sm font-semibold text-white">{t('bot.test.botSystemPrompt')}</h3>
          </div>
          <button
            onClick={() => {
              if (isEditingPrompt) {
                setEditedPrompt(systemPrompt);
              }
              setIsEditingPrompt(!isEditingPrompt);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {isEditingPrompt ? t('bot.test.cancel') : t('bot.test.edit')}
          </button>
        </div>

        {isEditingPrompt ? (
          <div className="space-y-3">
            {/* Templates Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full px-3 py-2 text-sm border border-white/20 rounded-lg hover:bg-white/5 flex items-center justify-between"
              >
                <span className="text-white/70">{t('bot.test.chooseTemplate')}</span>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </button>

              {showTemplates && (
                <div className="absolute z-10 w-full mt-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {PROMPT_TEMPLATES.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyTemplate(template)}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-sm text-white">{template.name}</div>
                      <div className="text-xs text-white/60 mt-1 line-clamp-2">{template.prompt}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Textarea */}
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-white bg-white/5"
              placeholder={t('bot.test.enterSystemPrompt')}
            />

            {/* Apply Button */}
            <div className="flex justify-end">
              <button
                onClick={applyPrompt}
                disabled={isSavingPrompt || editedPrompt.trim() === systemPrompt}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingPrompt ? (
                  <>{t('bot.test.applying')}</>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t('bot.test.apply')}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60 line-clamp-2">{systemPrompt}</p>
        )}
      </div>

      {/* Chat Container */}
      <div className="flex flex-col h-[600px] bg-black/40 backdrop-blur-md rounded-lg shadow-sm border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
          {botLogoUrl ? (
            <img
              src={botLogoUrl}
              alt={botName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {botName ? botName.charAt(0).toUpperCase() : 'B'}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">{botLogoUrl ? botName : t('bot.test.testChat')}</h3>
            <p className="text-sm text-white/60">
              {t('bot.test.subtitle')}
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm text-white/70 border border-white/20 rounded-lg hover:bg-white/5"
        >
          {t('bot.test.clearChat')}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg className="w-16 h-16 mb-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-white/60">{t('bot.test.startConversation')}</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <p className="text-xs font-medium text-white/60 mb-1 px-1">
                  {msg.role === 'user' ? t('bot.test.you') : botName}
                </p>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-lg px-4 py-3 bg-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="text-sm text-white ml-2">{t('bot.test.isTyping').replace('{botName}', botName)}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('bot.test.placeholder')}
            disabled={loading}
            className="flex-1 px-4 py-2 text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-white/40 bg-white/5"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            aria-label="Send message"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
