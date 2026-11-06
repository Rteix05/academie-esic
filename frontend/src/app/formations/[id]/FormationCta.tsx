'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import PurchaseConsent, { usePurchaseConsent } from '@/components/PurchaseConsent';
import { fetchInstitutPackOffers, formatPrice, offerAnchor, type InstitutPackOffer } from '@/lib/institutPacks';

/**
 * Appel à l'action principal de la fiche formation (partie interactive, côté client) :
 * accès si la formation est acquise ou incluse dans un accès complet à son institut, sinon
 * inscription gratuite, paiement Stripe ou achat de l'accès complet à l'institut.
 */
export default function FormationCta({ formationId, price, available, institut }: { formationId: number; price: number; available: boolean; institut?: string | null }) {
  const router = useRouter();
  const [owned, setOwned] = useState<boolean | null>(null);
  const [viaInstitut, setViaInstitut] = useState(false);
  const [offer, setOffer] = useState<InstitutPackOffer | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFree = !price || price <= 0;
  const consent = usePurchaseConsent();

  useEffect(() => {
    // Non connecté : 401 → pas acquise
    apiFetch('/api/mes-formations')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: number; access?: string }[]) => {
        const mine = Array.isArray(list) ? list.find((f) => f.id === formationId) : undefined;
        setOwned(!!mine);
        setViaInstitut(mine?.access === 'institut');
      })
      .catch(() => setOwned(false));

    // Accès complet à l'institut de la formation (sans institut : Institut Biblique, comme au catalogue)
    fetchInstitutPackOffers().then((offers) =>
      setOffer(offers.find((o) => o.institut === (institut || 'Institut Biblique Théologique')) ?? null),
    );
  }, [formationId, institut]);

  const handleCheckout = async () => {
    setError(null);
    // Formation payante : consentements obligatoires avant le paiement (CGV et accès immédiat)
    if (!isFree && !consent.validate()) return;
    setEnrolling(true);
    try {
      // Formation gratuite : inscription directe. Payante : session de paiement Stripe.
      const res = await apiFetch(
        isFree ? `/api/formations/${formationId}/enroll` : `/api/stripe/checkout/formation/${formationId}`,
        isFree ? { method: 'POST' } : { method: 'POST', body: JSON.stringify(consent.consents) },
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
    return <div className="h-14 w-64 rounded-full bg-brand-forest/[0.06]" aria-hidden="true" />;
  }

  if (owned) {
    return (
      <>
        <Link href="/dashboard" className="btn-primary">
          <CheckCircle className="h-5 w-5" aria-hidden="true" /> Accéder à ma formation
          <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </Link>
        <span className="chip">{viaInstitut ? 'Incluse dans votre accès complet' : 'Formation acquise'}</span>
      </>
    );
  }

  if (!available) {
    return <span className="btn cursor-not-allowed border border-brand-forest/15 text-brand-muted">Bientôt disponible</span>;
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      {!isFree && <PurchaseConsent state={consent} />}
      <button type="button" onClick={handleCheckout} disabled={enrolling} className="btn-primary">
        {enrolling ? (
          <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {isFree ? 'Inscription…' : 'Redirection vers le paiement…'}</>
        ) : isFree ? "S'inscrire gratuitement" : `S'inscrire — ${price} €`}
        <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
      </button>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-700">{error}</p>}
      {offer && !isFree && (
        <Link href={`/formations#${offerAnchor(offer.pack)}`} className="link text-base">
          Ou accédez à vie à toutes les formations de l&apos;{offer.institut} pour {formatPrice(offer.amount, offer.currency)}
        </Link>
      )}
    </div>
  );
}
