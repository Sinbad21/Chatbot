'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Inserisci un indirizzo email valido');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error('Configurazione API mancante. Contatta il supporto.');
      }

      const response = await fetch(`${apiUrl}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la richiesta');
      }

      setSuccess(true);
    } catch (err: any) {
      // Always show success to prevent email enumeration
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 mb-6">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Controlla la tua email
              </h2>
              <p className="text-slate-400 mb-6">
                Se esiste un account con l&apos;email <span className="text-fuchsia-400">{email}</span>,
                riceverai un link per reimpostare la password.
              </p>
              <p className="text-sm text-slate-500 mb-8">
                Non hai ricevuto l&apos;email? Controlla la cartella spam o riprova tra qualche minuto.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna al login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                ChatBot Studio
              </h1>
            </Link>
            <h2 className="text-2xl font-bold text-white mb-2">
              Password dimenticata?
            </h2>
            <p className="text-slate-400">
              Inserisci la tua email e ti invieremo un link per reimpostare la password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all"
                  placeholder="nome@azienda.com"
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
                  Invio in corso...
                </div>
              ) : (
                'Invia link di reset'
              )}
            </button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-fuchsia-400 hover:text-fuchsia-300 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna al login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
