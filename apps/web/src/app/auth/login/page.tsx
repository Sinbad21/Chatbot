'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Controlla se la sessione Ã¨ scaduta per timeout
    const timeout = searchParams.get('timeout');
    if (timeout === 'true') {
      setSessionExpired(true);
    }
  }, [searchParams]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error('API configuration is missing. Please contact support or try again later.');
      }

      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store only non-sensitive user data (tokens are now in httpOnly cookies)
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update last activity timestamp (non-httpOnly for client-side timeout checks)
      const now = Date.now();
      const isSecure = window.location.protocol === 'https:';
      const cookieOptions = `path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      document.cookie = `last_activity=${now}; ${cookieOptions}`;
      document.cookie = `auth_session=true; ${cookieOptions}`;

      // Hard redirect to ensure cookies are set and page fully reloads
      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.message.includes('fetch')) {
        setError('Unable to connect to the server. The API service is being configured. Please try again later.');
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#150a25] to-[#0f0520] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#2d1b4e]/80 to-[#150a25]/80 backdrop-blur-md border border-purple-500/20 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/70">Sign in to your Chatbot Studio account</p>
        </div>

        {sessionExpired && (
          <div className="bg-purple-500/20 border border-purple-500/30 text-white px-4 py-3 rounded-lg mb-6">
            La tua sessione Ã¨ scaduta dopo 30 minuti di inattivitÃ . Effettua nuovamente il login.
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-white/40 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder-white/40 transition-all"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-purple-500/30 rounded bg-purple-900/30"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-white/70">
                Remember me
              </label>
            </div>

            <Link href="/auth/forgot-password" className="text-sm text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:from-purple-500 hover:to-fuchsia-500 font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/70">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-fuchsia-400 font-semibold hover:text-fuchsia-300 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="block text-center text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors"
          >
            â† Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#150a25] to-[#0f0520] flex items-center justify-center">
        <div className="text-white/80">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

