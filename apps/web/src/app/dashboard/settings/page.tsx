'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '@/lib/i18n';
import { GlassCard } from '@/components/dashboard/ui';

type TabType = 'profile' | 'api-keys' | 'preferences' | 'security';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // API Key form state
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    loadUserData();
    loadApiKeys();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      const response = await axios.get(`${apiUrl}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      setName(response.data.name || '');
      setEmail(response.data.email || '');
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        return;
      }

      const response = await axios.get(`${apiUrl}/api/v1/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // TODO: Implement profile update API endpoint
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: t('settings.profileUpdated') });
      setSaving(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.failedToUpdate') });
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('settings.passwordsDoNotMatch') });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: t('settings.passwordTooShort') });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // TODO: Implement password change API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: t('settings.passwordChanged') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaving(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.failedToChange') });
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newKeyName.trim()) {
      setMessage({ type: 'error', text: t('settings.enterKeyName') });
      return;
    }

    setCreatingKey(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setMessage({ type: 'error', text: t('analytics.authTokenNotFound') });
        setCreatingKey(false);
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/v1/api-keys`,
        { name: newKeyName.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Store the full key to display (only shown once)
      setGeneratedKey(response.data.key);

      // Add to list with masked key
      setApiKeys([
        ...apiKeys,
        {
          ...response.data,
          key: response.data.key.substring(0, 20) + '...',
        },
      ]);

      setNewKeyName('');
      setCreatingKey(false);
      setMessage({ type: 'success', text: t('settings.apiKeyCreated') });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.failedToCreate') });
      setCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm(t('settings.confirmRevoke'))) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setMessage({ type: 'error', text: t('analytics.authTokenNotFound') });
        return;
      }

      await axios.delete(`${apiUrl}/api/v1/api-keys/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApiKeys(apiKeys.filter((key) => key.id !== id));
      setMessage({ type: 'success', text: t('settings.apiKeyRevoked') });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.failedToRevoke') });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(generatedKey || key);
    setMessage({ type: 'success', text: t('settings.apiKeyCopied') });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-platinum-400">{t('settings.loadingSettings')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-serif">{t('settings.title')}</h1>
        <p className="text-white/60 mt-2">{t('settings.subtitle')}</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-800' : 'bg-red-950/50 text-red-400 border border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-platinum-800 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-platinum-300 text-platinum-300'
                : 'border-transparent text-platinum-500 hover:text-platinum-300 hover:border-platinum-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.profile')}
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`${
              activeTab === 'api-keys'
                ? 'border-platinum-300 text-platinum-300'
                : 'border-transparent text-platinum-500 hover:text-platinum-300 hover:border-platinum-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.apiKeys')}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`${
              activeTab === 'preferences'
                ? 'border-platinum-300 text-platinum-300'
                : 'border-transparent text-platinum-500 hover:text-platinum-300 hover:border-platinum-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.preferences')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-platinum-300 text-platinum-300'
                : 'border-transparent text-platinum-500 hover:text-platinum-300 hover:border-platinum-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.security')}
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">{t('settings.profileInformation')}</h2>
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/60 mb-2">
                  {t('auth.email').replace('Email', 'Name')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-platinum-400 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300/70 mb-2">{t('settings.authMethod')}</label>
                <div className="px-4 py-3 bg-purple-900/30 border border-purple-500/20 rounded-lg text-purple-300/70">
                  {t('settings.emailPassword')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300/70 mb-2">{t('settings.role')}</label>
                <div className="px-4 py-3 bg-purple-900/30 border border-purple-500/20 rounded-lg text-purple-300/70">
                  {user?.role || 'USER'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300/70 mb-2">{t('settings.memberSince')}</label>
                <div className="px-4 py-3 bg-purple-900/30 border border-purple-500/20 rounded-lg text-purple-300/70">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                {saving ? t('settings.saving') : t('settings.saveChanges')}
              </button>
            </form>
          </GlassCard>

          {/* Change Password Section */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">{t('settings.changePassword')}</h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-platinum-400 mb-2">
                  {t('settings.currentPassword')}
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-platinum-400 mb-2">
                  {t('settings.newPassword')}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
                  required
                  minLength={8}
                />
                <p className="text-xs text-platinum-500 mt-1">{t('settings.passwordMin8')}</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-platinum-400 mb-2">
                  {t('settings.confirmNewPassword')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                {saving ? t('settings.changing') : t('settings.changePasswordBtn')}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-8">
          {/* Generated Key Display */}
          {generatedKey && (
            <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-fuchsia-300 mb-2">{t('settings.apiKeyGenerated')}</h3>
              <p className="text-sm text-fuchsia-300/70 mb-4">
                {t('settings.saveKeyNow')}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-purple-900/50 border border-purple-500/30 rounded-lg text-sm font-mono text-white">
                  {generatedKey}
                </code>
                <button
                  onClick={() => handleCopyKey(generatedKey)}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 font-medium shadow-lg shadow-purple-500/25"
                >
                  {t('settings.copy')}
                </button>
              </div>
              <button
                onClick={() => setGeneratedKey(null)}
                className="mt-4 text-sm text-fuchsia-400 hover:text-fuchsia-300 underline transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          )}

          {/* Create New Key */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">{t('settings.createNewApiKey')}</h2>
            <p className="text-sm text-purple-300/70 mb-6">
              {t('settings.apiKeyDescription')}
            </p>

            <div className="flex gap-4">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={t('settings.keyNamePlaceholder')}
                className="flex-1 px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-purple-400/50 transition-all"
              />
              <button
                onClick={handleGenerateApiKey}
                disabled={creatingKey || !newKeyName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                {creatingKey ? t('settings.generating') : t('settings.generateKey')}
              </button>
            </div>
          </GlassCard>

          {/* API Keys List */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">{t('settings.yourApiKeys')}</h2>

            {apiKeys.length === 0 ? (
              <p className="text-center text-platinum-500 py-8">{t('settings.noApiKeys')}</p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border border-platinum-800 rounded-lg p-4 hover:border-platinum-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-platinum-100">{key.name}</h3>
                        <code className="text-sm text-platinum-400 font-mono mt-1 block">{key.key}</code>
                        <div className="flex items-center gap-4 mt-2 text-xs text-platinum-500">
                          <span>{t('settings.createdDate').replace('{date}', new Date(key.createdAt).toLocaleDateString())}</span>
                          {key.lastUsed && <span>{t('settings.lastUsed').replace('{date}', new Date(key.lastUsed).toLocaleDateString())}</span>}
                          {!key.lastUsed && <span>{t('settings.neverUsed')}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyKey(key.key)}
                          className="px-3 py-1 text-sm text-platinum-300 hover:text-platinum-100 font-medium"
                        >
                          {t('settings.copy')}
                        </button>
                        <button
                          onClick={() => handleRevokeApiKey(key.id)}
                          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 font-medium"
                        >
                          {t('settings.revoke')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-8">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">{t('settings.preferences')}</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-purple-300/70 mb-2">
                  {t('settings.timezone')}
                </label>
                <select
                  id="timezone"
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white transition-all"
                >
                  <option>UTC</option>
                  <option>Europe/Rome</option>
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-purple-300/70 mb-2">
                  {t('settings.language')}
                </label>
                <select
                  id="language"
                  className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white transition-all"
                >
                  <option>English</option>
                  <option>Italiano</option>
                  <option>Espanol</option>
                  <option>Francais</option>
                  <option>Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300/70 mb-4">{t('settings.emailNotifications')}</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-fuchsia-600 border-purple-500/30 rounded focus:ring-fuchsia-500 bg-purple-900/30"
                    />
                    <span className="ml-3 text-sm text-purple-300/70">{t('settings.newConversations')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-fuchsia-600 border-purple-500/30 rounded focus:ring-fuchsia-500 bg-purple-900/30"
                    />
                    <span className="ml-3 text-sm text-purple-300/70">{t('settings.botOfflineAlerts')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-fuchsia-600 border-purple-500/30 rounded focus:ring-fuchsia-500 bg-purple-900/30"
                    />
                    <span className="ml-3 text-sm text-purple-300/70">{t('settings.weeklyReports')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-fuchsia-600 border-purple-500/30 rounded focus:ring-fuchsia-500 bg-purple-900/30"
                    />
                    <span className="ml-3 text-sm text-purple-300/70">{t('settings.marketingEmails')}</span>
                  </label>
                </div>
              </div>

              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 font-medium transition-all shadow-lg shadow-purple-500/25"
              >
                {t('settings.savePreferences')}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">{t('settings.securitySettings')}</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-platinum-100 mb-2">{t('settings.twoFactorAuth')}</h3>
                <p className="text-sm text-platinum-400 mb-4">
                  {t('settings.twoFactorAuthDescription')}
                </p>
                <button
                  disabled
                  className="px-6 py-2 bg-platinum-800 text-platinum-500 rounded-lg cursor-not-allowed font-medium"
                >
                  {t('settings.enable2FA')}
                </button>
              </div>

              <div className="border-t border-platinum-800 pt-6">
                <h3 className="text-sm font-medium text-platinum-100 mb-2">{t('settings.activeSessions')}</h3>
                <p className="text-sm text-platinum-400 mb-4">{t('settings.activeSessionsDescription')}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-platinum-800 rounded-lg">
                    <div>
                      <div className="font-medium text-platinum-100">{t('settings.currentSession')}</div>
                      <div className="text-sm text-platinum-400">Chrome on macOS - {new Date().toLocaleString()}</div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-xs font-medium rounded-full">Active</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-platinum-800 pt-6">
                <h3 className="text-sm font-medium text-platinum-100 mb-2">{t('settings.dangerZone')}</h3>
                <p className="text-sm text-platinum-400 mb-4">{t('settings.irreversibleActions')}</p>

                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                  {t('settings.deleteAccount')}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
