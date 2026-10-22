'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MailCheck } from 'lucide-react';
import AuthShell, { FormMessage } from '@/components/AuthShell';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Une erreur est survenue.');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Saisissez votre email : nous vous enverrons un lien pour choisir un nouveau mot de passe."
      footer={<Link href="/login" className="font-semibold text-brand-emerald hover:underline">← Retour à la connexion</Link>}
    >
      {error && <FormMessage tone="error">{error}</FormMessage>}

      {success ? (
        <div className="card p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
            <MailCheck className="h-8 w-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-brand-forest">Vérifiez votre boîte mail</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Si un compte existe pour <strong className="text-brand-ink">{email}</strong>, un lien de réinitialisation valable 1 heure vient d&apos;être envoyé.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="email">Adresse email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="vous@exemple.fr" />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-between py-4">
            {isLoading ? 'Envoi en cours…' : 'Envoyer le lien'}
            <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </button>
        </form>
      )}
    </AuthShell>
  );
}
