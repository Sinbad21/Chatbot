'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/v1/auth/verify-reset-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        setTokenValid(response.ok);
      } catch {
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'La password deve essere di almeno 8 caratteri';
    }
    if (!/[A-Z]/.test(password)) {
      return 'La password deve contenere almeno una lettera maiuscola';
    }
    if (!/[a-z]/.test(password)) {
      return 'La password deve contenere almeno una lettera minuscola';
    }
    if (!/[0-9]/.test(password)) {
      return 'La password deve contenere almeno un numero';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il reset della password');
      }

      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verifica del link in corso...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-6">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Link non valido o scaduto
            </h2>
            <p className="text-slate-400 mb-6">
              Il link per reimpostare la password non è valido o è scaduto.
              Richiedi un nuovo link di reset.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium hover:from-fuchsia-500 hover:to-purple-500 transition-all"
            >
              Richiedi nuovo link
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 mt-4 text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Password reimpostata!
            </h2>
            <p className="text-slate-400 mb-6">
              La tua password è stata reimpostata con successo.
              Verrai reindirizzato al login...
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Vai al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                ChatBot Studio
              </h1>
            </Link>
            <h2 className="text-2xl font-bold text-white mb-2">
              Reimposta la password
            </h2>
            <p className="text-slate-400">
              Inserisci la tua nuova password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Nuova Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                  placeholder="Minimo 8 caratteri"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Conferma Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                  placeholder="Ripeti la password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Reimpostazione in corso...
                </div>
              ) : (
                'Reimposta password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="w-8 h-8 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
