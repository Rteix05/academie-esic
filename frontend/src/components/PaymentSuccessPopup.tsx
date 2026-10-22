'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, XCircle, X, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function PaymentSuccessPopup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState<boolean>(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'canceled' | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled  = searchParams.get('canceled');

    if (canceled === 'true') {
      setStatus('canceled');
      setVisible(true);
      return;
    }

    if (sessionId) {
      if (status === 'success') return;

      setStatus('loading');
      setVisible(true);

      // Détecte le type d'achat depuis le sessionId (on essaie les deux endpoints).
      // Même hôte que le login (API_URL) : sinon le cookie de session ne serait pas envoyé.
      const tryConfirm = (path: string) =>
        apiFetch(path, {
          method: 'POST',
          body: JSON.stringify({ session_id: sessionId }),
        }).then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) return Promise.reject(data);
          return data;
        });

      // Essaie formation/masterclass en premier, puis événement
      tryConfirm('/api/stripe/confirm')
        .catch(() => tryConfirm('/api/stripe/confirm/event'))
        .then(() => setStatus('success'))
        .catch((err) => { console.error('confirm catch:', err); setStatus('canceled'); });
    }
  }, [searchParams, status]);

  const close = () => {
    setVisible(false);
    window.location.href = '/dashboard';
  };

  if (!visible || !status) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-forest/40 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-popup-title"
        className="relative w-full max-w-sm overflow-hidden rounded-4xl bg-white p-8 shadow-float dark:bg-[#18291e]"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-mint dark:bg-white/5" />
        <button
          onClick={close}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-mint hover:text-brand-forest"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {status === 'loading' ? (
          <div className="relative flex flex-col items-center gap-4 py-6 text-center" role="status">
            <Loader2 className="h-10 w-10 animate-spin text-brand-emerald" aria-hidden="true" />
            <p id="payment-popup-title" className="font-display font-semibold text-brand-forest">Confirmation du paiement…</p>
          </div>
        ) : status === 'success' ? (
          <div className="relative flex flex-col items-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
              <CheckCircle className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 id="payment-popup-title" className="mt-2 font-display text-xl font-semibold text-brand-forest">Paiement confirmé !</h2>
            <p className="text-sm leading-relaxed text-brand-muted">
              Votre achat est confirmé. Retrouvez votre contenu dans votre espace personnel.
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4 w-full justify-between">
              Accéder à mon espace
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </button>
            <button onClick={close} className="text-sm text-brand-muted transition hover:text-brand-forest">
              Rester sur cette page
            </button>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-3 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <XCircle className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 id="payment-popup-title" className="mt-2 font-display text-xl font-semibold text-brand-forest">Paiement non finalisé</h2>
            <p className="text-sm leading-relaxed text-brand-muted">
              Votre paiement n&apos;a pas été complété. Aucun montant n&apos;a été débité.
            </p>
            <button onClick={close} className="btn-secondary mt-4 w-full">
              Retour au catalogue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
