'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import AuthShell, { FormMessage } from '@/components/AuthShell';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptCgu, setAcceptCgu] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mêmes règles que le backend (8 caractères, au moins une lettre et un chiffre)
  const rules = [
    { ok: password.length >= 8, label: '8 caractères minimum' },
    { ok: /[A-Za-z]/.test(password) && /\d/.test(password), label: 'Au moins une lettre et un chiffre' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Rejoignez l'Académie"
      subtitle="Créez votre compte pour accéder à nos formations et masterclasses."
      footer={<>Déjà inscrit ?{' '}<Link href="/login" className="font-semibold text-brand-emerald hover:underline">Connectez-vous</Link></>}
    >
      {error && <FormMessage tone="error">{error}</FormMessage>}

      {success ? (
        <div className="card p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
            <Check className="h-8 w-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-brand-forest">Inscription réussie !</h2>
          <p className="mt-2 text-sm text-brand-muted">Redirection vers la page de connexion…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="email">Adresse email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="vous@exemple.fr" />
          </div>

          <div>
            <label className="field-label" htmlFor="password">Mot de passe</label>
            <input id="password" type="password" required autoComplete="new-password" aria-describedby="password-rules" value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="••••••••" />
            <ul id="password-rules" className="mt-3 flex flex-wrap gap-2">
              {rules.map((rule) => (
                <li key={rule.label} className={`chip ${rule.ok ? 'bg-brand-sage' : 'bg-gray-100 text-brand-muted dark:bg-white/5'}`}>
                  <Check className={`h-3.5 w-3.5 ${rule.ok ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true" />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="field-label" htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input id="confirm-password" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field" placeholder="••••••••" />
          </div>

          {/* Acceptation expresse des CGU, obligatoire pour créer un compte */}
          <div className="flex items-start gap-3">
            <input
              id="accept-cgu"
              type="checkbox"
              required
              checked={acceptCgu}
              onChange={(e) => setAcceptCgu(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-brand-forest/30 accent-brand-emerald"
            />
            <label htmlFor="accept-cgu" className="text-sm text-brand-muted">
              J&apos;ai lu et j&apos;accepte les{' '}
              <Link href="/cgu" target="_blank" rel="noopener" className="font-semibold text-brand-forest underline underline-offset-4 hover:text-brand-emerald dark:text-emerald-200">
                conditions générales d&apos;utilisation<span className="sr-only"> (nouvelle fenêtre)</span>
              </Link>.
            </label>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-between py-4">
            {isLoading ? 'Création en cours…' : 'Créer mon compte'}
            <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </button>
        </form>
      )}
    </AuthShell>
  );
}
