'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

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
    // Mock API keys for now - replace with real API call when endpoint exists
    setApiKeys([
      {
        id: '1',
        name: 'Production Key',
        key: 'sk_live_••••••••••••••••',
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // TODO: Implement profile update API endpoint
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setSaving(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // TODO: Implement password change API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaving(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newKeyName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a key name' });
      return;
    }

    setCreatingKey(true);
    setMessage(null);

    try {
      // TODO: Implement API key generation endpoint
      const mockKey = 'sk_live_' + Math.random().toString(36).substring(2, 34);
      setGeneratedKey(mockKey);

      // Add to list
      setApiKeys([
        ...apiKeys,
        {
          id: Date.now().toString(),
          name: newKeyName,
          key: mockKey.substring(0, 20) + '••••••••••••',
          lastUsed: null,
          createdAt: new Date().toISOString(),
        },
      ]);

      setNewKeyName('');
      setCreatingKey(false);
      setMessage({ type: 'success', text: 'API key created successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create API key' });
      setCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement API key revocation endpoint
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      setMessage({ type: 'success', text: 'API key revoked successfully' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to revoke API key' });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(generatedKey || key);
    setMessage({ type: 'success', text: 'API key copied to clipboard!' });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
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
            Profile
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`${
              activeTab === 'api-keys'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`${
              activeTab === 'preferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
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
                  Email
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {user?.role || 'USER'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
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
                  New Password
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
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
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
                {saving ? 'Changing...' : 'Change Password'}
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
              <h3 className="text-lg font-semibold text-green-900 mb-2">API Key Generated!</h3>
              <p className="text-sm text-green-700 mb-4">
                Save this key now - you won't be able to see it again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-white border border-green-300 rounded-lg text-sm font-mono text-gray-900">
                  {generatedKey}
                </code>
                <button
                  onClick={() => handleCopyKey(generatedKey)}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={() => setGeneratedKey(null)}
                className="mt-4 text-sm text-green-700 hover:text-green-800 underline"
              >
                Close
              </button>
            </div>
          )}

          {/* Create New Key */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New API Key</h2>
            <p className="text-sm text-gray-600 mb-6">
              API keys allow you to authenticate API requests. Keep your keys secure and never share them publicly.
            </p>

            <div className="flex gap-4">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
              <button
                onClick={handleGenerateApiKey}
                disabled={creatingKey || !newKeyName.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {creatingKey ? 'Generating...' : 'Generate Key'}
              </button>
            </div>
          </div>

          {/* API Keys List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your API Keys</h2>

            {apiKeys.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No API keys yet. Create one above to get started.</p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{key.name}</h3>
                        <code className="text-sm text-gray-600 font-mono mt-1 block">{key.key}</code>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                          {key.lastUsed && <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>}
                          {!key.lastUsed && <span>Never used</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyKey(key.key)}
                          className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleRevokeApiKey(key.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Revoke
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
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
                  Language
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
                <label className="block text-sm font-medium text-gray-700 mb-4">Email Notifications</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">New conversations</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Bot offline alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Weekly reports</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Marketing emails</span>
                  </label>
                </div>
              </div>

              <button
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add an extra layer of security to your account (coming soon)
                </p>
                <button
                  disabled
                  className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                >
                  Enable 2FA (Coming Soon)
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Active Sessions</h3>
                <p className="text-sm text-gray-600 mb-4">Manage your active sessions across devices</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Current Session</div>
                      <div className="text-sm text-gray-600">Chrome on macOS • {new Date().toLocaleString()}</div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">Irreversible actions</p>

                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
