'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';

  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token manquant. Veuillez refaire une demande de réinitialisation.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Une erreur est survenue.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFA] flex flex-col justify-center items-center p-6 font-sans antialiased">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0F291E] tracking-tight">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-500 mt-2">Choisissez un mot de passe sécurisé (8 caractères minimum).</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl text-center">
            {error}
            {!token && (
              <div className="mt-3">
                <Link href="/forgot-password" className="underline font-bold">
                  Refaire une demande
                </Link>
              </div>
            )}
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#0F291E] mb-2">Mot de passe réinitialisé !</h2>
            <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full py-4 bg-[#0F291E] text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
