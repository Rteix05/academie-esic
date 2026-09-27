'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

/**
 * Appel à l'action principal de la fiche formation (partie interactive, côté client) :
 * accès si la formation est acquise, sinon inscription gratuite ou paiement Stripe.
 */
export default function FormationCta({ formationId, price, available }: { formationId: number; price: number; available: boolean }) {
  const router = useRouter();
  const [owned, setOwned] = useState<boolean | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFree = !price || price <= 0;

  useEffect(() => {
    // Non connecté : 401 → pas acquise
    apiFetch('/api/mes-formations')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: number }[]) => setOwned(Array.isArray(list) && list.some((f) => f.id === formationId)))
      .catch(() => setOwned(false));
  }, [formationId]);

  const handleCheckout = async () => {
    setEnrolling(true);
    setError(null);
    try {
      // Formation gratuite : inscription directe. Payante : session de paiement Stripe.
      const res = await apiFetch(
        isFree ? `/api/formations/${formationId}/enroll` : `/api/stripe/checkout/formation/${formationId}`,
        { method: 'POST' },
      );
      if (res.status === 401) { router.push('/login'); return; }

      const data: { url?: string; message?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription.");

      if (isFree) { setOwned(true); return; }
      if (!data.url) throw new Error('URL de paiement manquante.');
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de finaliser l'inscription.");
    } finally {
      setEnrolling(false);
    }
  };

  if (owned === null) {
    return <div className="h-14 w-64 animate-pulse rounded-full bg-white/15" aria-hidden="true" />;
  }

  if (owned) {
    return (
      <>
        <Link href="/dashboard" className="btn bg-white py-3 pl-6 pr-2 text-brand-forest shadow-soft hover:-translate-y-0.5">
          <CheckCircle className="h-5 w-5 text-brand-emerald" aria-hidden="true" /> Accéder à ma formation
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald text-white"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </Link>
        <span className="chip bg-white/15 text-white">Formation acquise</span>
      </>
    );
  }

  if (!available) {
    return <span className="btn cursor-not-allowed bg-white/15 px-6 py-3 text-white/80">Bientôt disponible</span>;
  }

  return (
    <div className="flex flex-col gap-3">
      <button onClick={handleCheckout} disabled={enrolling} className="btn bg-white py-3 pl-6 pr-2 text-brand-forest shadow-soft hover:-translate-y-0.5">
        {enrolling ? (
          <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {isFree ? 'Inscription…' : 'Redirection vers le paiement…'}</>
        ) : isFree ? "S'inscrire gratuitement" : `S'inscrire — ${price} €`}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald text-white"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
      </button>
      {error && <p role="alert" className="rounded-2xl bg-red-500/90 px-4 py-2 text-sm font-medium text-white">{error}</p>}
    </div>
  );
}
