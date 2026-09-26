'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, fetchMe, notifyAuthChanged } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Déjà connecté (cookie de session valide) : direction l'espace élève
  useEffect(() => {
    fetchMe().then((me) => { if (me) router.push('/dashboard'); });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiFetch('/api/login_check', {
        method: 'POST',
        // Attention : par défaut LexikJWT attend la clé "username" (même si c'est un email)
        body: JSON.stringify({ username: email, password: password }),
      });

      if (response.status === 429) {
        throw new Error('Trop de tentatives. Réessayez dans quelques minutes.');
      }
      if (!response.ok) {
        throw new Error('Email ou mot de passe incorrect.');
      }

      // Le JWT est déposé par le serveur dans un cookie httpOnly : rien à stocker côté client
      localStorage.removeItem('jwt_token'); // nettoyage de l'ancien stockage
      notifyAuthChanged(true);

      // Redirection vers le futur espace élève
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFA] flex flex-col justify-center items-center p-6 text-[#1C2C24] font-sans antialiased selection:bg-emerald-100">
      
      {/* Bouton retour discret */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#0F291E] transition">
          ← Retour à l'accueil
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-10 shadow-sm">
        
        {/* En-tête du formulaire */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0F291E] tracking-tight">
            Espace Élève
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Connectez-vous pour accéder à vos masterclasses.
          </p>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Formulaire */}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider" htmlFor="password">
                Mot de passe
              </label>
              <Link href="/forgot-password" className="text-xs text-emerald-700 font-semibold hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#0F291E] text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        {/* Lien vers l'inscription */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-emerald-700 font-bold hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}