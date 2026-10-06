'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatPrice, offerAnchor, type SubscriptionOffer } from '@/lib/subscriptions';
import PurchaseConsent, { usePurchaseConsent } from './PurchaseConsent';

/**
 * Carte d'abonnement mensuel d'un institut (catalogue des formations).
 * La souscription passe par les mêmes consentements que les achats (CGV, accès immédiat),
 * affichés au premier clic puis vérifiés par le backend.
 */
export default function SubscriptionOfferCard({ offer, subscribed }: { offer: SubscriptionOffer; subscribed: boolean }) {
  const router = useRouter();
  const consent = usePurchaseConsent();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async () => {
    setError(null);
    if (!open) { setOpen(true); return; }
    if (!consent.validate()) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/stripe/checkout/subscription/${offer.plan}`, {
        method: 'POST',
        body: JSON.stringify(consent.consents),
      });
      if (res.status === 401) { router.push('/login'); return; }

      const data: { url?: string; message?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Erreur serveur (${res.status})`);
      if (!data.url) throw new Error('URL de paiement manquante.');
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'initialiser l'abonnement.");
      setLoading(false);
    }
  };

  return (
    <section
      id={offerAnchor(offer.plan)}
      aria-labelledby={`${offerAnchor(offer.plan)}-titre`}
      className="scroll-mt-24 rounded-4xl bg-brand-mint p-6 sm:p-8 dark:bg-[#10231a]"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="icon-tile h-12 w-12 shrink-0 bg-white dark:bg-white/10"><RefreshCw className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h3 id={`${offerAnchor(offer.plan)}-titre`} className="font-display text-lg font-semibold text-brand-forest">
              Abonnement mensuel
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              Toutes les formations de l&apos;{offer.institut} en accès illimité. Sans engagement : résiliable à tout moment
              depuis votre espace, l&apos;accès reste ouvert jusqu&apos;à la fin du mois payé.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
          <p className="font-display text-brand-forest">
            <span className="text-3xl font-semibold">{formatPrice(offer.amount, offer.currency)}</span>
            <span className="text-sm text-brand-muted"> / mois</span>
          </p>
          {subscribed ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip bg-white dark:bg-white/10"><CheckCircle className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> Vous êtes abonné</span>
              <Link href="/dashboard" className="btn-secondary py-2">Mon espace</Link>
            </div>
          ) : (
            <button type="button" onClick={subscribe} disabled={loading} aria-expanded={open} className="btn-primary">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Redirection vers le paiement…</>
              ) : open ? "Confirmer et s'abonner" : "S'abonner"}
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </button>
          )}
        </div>
      </div>

      {open && !subscribed && (
        <div className="mt-6 max-w-2xl border-t border-brand-forest/10 pt-5 dark:border-white/10">
          <PurchaseConsent state={consent} />
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</p>}
    </section>
  );
}
