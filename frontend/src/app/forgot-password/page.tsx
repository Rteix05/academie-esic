'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Une erreur est survenue.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFA] flex flex-col justify-center items-center p-6 font-sans antialiased">
      <div className="absolute top-8 left-8">
        <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-[#0F291E] transition">
          ← Retour à la connexion
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0F291E] tracking-tight">Mot de passe oublié</h1>
          <p className="text-sm text-gray-500 mt-2">
            Saisissez votre email et nous vous enverrons un lien de réinitialisation.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#0F291E] mb-2">Email envoyé !</h2>
            <p className="text-sm text-gray-500">
              Si cet email existe dans notre base, vous recevrez un lien dans quelques instants.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 px-6 py-2.5 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider" htmlFor="email">
                Adresse Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
                placeholder="eleve@esic.fr"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#0F291E] text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
