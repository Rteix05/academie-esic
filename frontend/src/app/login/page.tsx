'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AuthShell, { FormMessage } from '@/components/AuthShell';
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
    <AuthShell
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour retrouver vos formations et masterclasses."
      footer={<>Pas encore de compte ?{' '}<Link href="/register" className="font-semibold text-brand-emerald hover:underline">Inscrivez-vous</Link></>}
    >
      {error && <FormMessage tone="error">{error}</FormMessage>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="field-label" htmlFor="email">Adresse email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="vous@exemple.fr"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="field-label" htmlFor="password">Mot de passe</label>
            <Link href="/forgot-password" className="mb-2 text-sm font-medium text-brand-emerald hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full justify-between py-4">
          {isLoading ? 'Connexion…' : 'Se connecter'}
          <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </button>
      </form>
    </AuthShell>
  );
}
