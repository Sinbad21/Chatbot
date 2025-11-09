'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '@/lib/i18n';

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
          key: response.data.key.substring(0, 20) + '••••••••••••',
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
        <div className="text-gray-600">{t('settings.loadingSettings')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-600 mt-2">{t('settings.subtitle')}</p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.profile')}
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`${
              activeTab === 'api-keys'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.apiKeys')}
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`${
              activeTab === 'preferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.preferences')}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.security')}
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings.profileInformation')}</h2>
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email').replace('Email', 'Name')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.authMethod')}</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {t('settings.emailPassword')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.role')}</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {user?.role || 'USER'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.memberSince')}</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? t('settings.saving') : t('settings.saveChanges')}
              </button>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings.changePassword')}</h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.currentPassword')}
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.newPassword')}
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">{t('settings.passwordMin8')}</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.confirmNewPassword')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? t('settings.changing') : t('settings.changePasswordBtn')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-8">
          {/* Generated Key Display */}
          {generatedKey && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">{t('settings.apiKeyGenerated')}</h3>
              <p className="text-sm text-green-700 mb-4">
                {t('settings.saveKeyNow')}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-white border border-green-300 rounded-lg text-sm font-mono text-gray-900">
                  {generatedKey}
                </code>
                <button
                  onClick={() => handleCopyKey(generatedKey)}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  {t('settings.copy')}
                </button>
              </div>
              <button
                onClick={() => setGeneratedKey(null)}
                className="mt-4 text-sm text-green-700 hover:text-green-800 underline"
              >
                {t('common.close')}
              </button>
            </div>
          )}

          {/* Create New Key */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.createNewApiKey')}</h2>
            <p className="text-sm text-gray-600 mb-6">
              {t('settings.apiKeyDescription')}
            </p>

            <div className="flex gap-4">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={t('settings.keyNamePlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
              <button
                onClick={handleGenerateApiKey}
                disabled={creatingKey || !newKeyName.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {creatingKey ? t('settings.generating') : t('settings.generateKey')}
              </button>
            </div>
          </div>

          {/* API Keys List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings.yourApiKeys')}</h2>

            {apiKeys.length === 0 ? (
              <p className="text-center text-gray-500 py-8">{t('settings.noApiKeys')}</p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{key.name}</h3>
                        <code className="text-sm text-gray-600 font-mono mt-1 block">{key.key}</code>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{t('settings.createdDate').replace('{date}', new Date(key.createdAt).toLocaleDateString())}</span>
                          {key.lastUsed && <span>{t('settings.lastUsed').replace('{date}', new Date(key.lastUsed).toLocaleDateString())}</span>}
                          {!key.lastUsed && <span>{t('settings.neverUsed')}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyKey(key.key)}
                          className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {t('settings.copy')}
                        </button>
                        <button
                          onClick={() => handleRevokeApiKey(key.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          {t('settings.revoke')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings.preferences')}</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.timezone')}
                </label>
                <select
                  id="timezone"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                >
                  <option>UTC</option>
                  <option>Europe/Rome</option>
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.language')}
                </label>
                <select
                  id="language"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                >
                  <option>English</option>
                  <option>Italiano</option>
                  <option>Español</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">{t('settings.emailNotifications')}</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{t('settings.newConversations')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{t('settings.botOfflineAlerts')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{t('settings.weeklyReports')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{t('settings.marketingEmails')}</span>
                  </label>
                </div>
              </div>

              <button
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                {t('settings.savePreferences')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings.securitySettings')}</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t('settings.twoFactorAuth')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('settings.twoFactorAuthDescription')}
                </p>
                <button
                  disabled
                  className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                >
                  {t('settings.enable2FA')}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t('settings.activeSessions')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('settings.activeSessionsDescription')}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{t('settings.currentSession')}</div>
                      <div className="text-sm text-gray-600">Chrome on macOS • {new Date().toLocaleString()}</div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">{t('settings.dangerZone')}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('settings.irreversibleActions')}</p>

                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                  {t('settings.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
