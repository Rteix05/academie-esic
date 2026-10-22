'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import AuthShell, { FormMessage } from '@/components/AuthShell';
import { Spinner } from '@/components/ui';
import { apiFetch } from '@/lib/api';

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
      setError('Lien incomplet. Veuillez refaire une demande de réinitialisation.');
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
      const res = await apiFetch('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Une erreur est survenue.');

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe sécurisé : 8 caractères minimum, avec au moins une lettre et un chiffre."
      footer={<Link href="/login" className="font-semibold text-brand-emerald hover:underline">← Retour à la connexion</Link>}
    >
      {error && (
        <FormMessage tone="error">
          {error}
          {!token && (
            <Link href="/forgot-password" className="mt-2 block font-semibold underline">Refaire une demande</Link>
          )}
        </FormMessage>
      )}

      {success ? (
        <div className="card p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
            <Check className="h-8 w-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-brand-forest">Mot de passe réinitialisé !</h2>
          <p className="mt-2 text-sm text-brand-muted">Redirection vers la page de connexion…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="password">Nouveau mot de passe</label>
            <input id="password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="••••••••" />
          </div>
          <div>
            <label className="field-label" htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input id="confirm-password" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoading || !token} className="btn-primary w-full justify-between py-4">
            {isLoading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
            <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
