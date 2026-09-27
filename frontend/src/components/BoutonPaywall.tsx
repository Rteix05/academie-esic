'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Video, Package, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface BoutonPaywallProps {
  masterclassId: number;
  prices: {
    pdf: number | null;
    video: number | null;
    pack: number | null;
  };
}

export default function BoutonPaywall({ masterclassId, prices }: BoutonPaywallProps) {
  const router = useRouter();
  const [loadingOption, setLoadingOption] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePayment = async (option: 'pdf' | 'video' | 'pack') => {
    setLoadingOption(option);
    setErrorMsg(null);
    try {
      // On envoie l'ID ET l'option choisie au backend (session via cookie httpOnly)
      const res = await apiFetch(`/api/stripe/checkout/${masterclassId}/${option}`, { method: 'POST' });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        let errMsg = `Erreur serveur (${res.status})`;
        try {
          const errData = await res.json();
          errMsg = errData.error || errData.message || errData.detail || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.url) {
        // Redirection externe vers la page de paiement Stripe
        window.location.assign(data.url);
      }
    } catch (error) {
      console.error('Stripe error:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Impossible de joindre la passerelle de paiement.');
    } finally {
      setLoadingOption(null);
    }
  };

  const hasAnyPrice = prices.pdf || prices.video || prices.pack;

  if (!hasAnyPrice) {
    return (
      <div className="flex items-start gap-2 rounded-2xl bg-brand-mint p-4 text-sm text-brand-muted dark:bg-white/5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-emerald" aria-hidden="true" />
        <span>Les tarifs ne sont pas encore renseignés pour cette masterclass.</span>
      </div>
    );
  }

  const options = [
    { key: 'pdf' as const,   price: prices.pdf,   icon: FileText, label: 'PDF seul' },
    { key: 'video' as const, price: prices.video, icon: Video,    label: 'Vidéo seule' },
  ];

  return (
    <div className="flex w-full flex-col gap-2">
      {options.map(({ key, price, icon: Icon, label }) => price ? (
        <button
          key={key}
          onClick={() => handlePayment(key)}
          disabled={loadingOption !== null}
          className="flex w-full items-center justify-between rounded-2xl border border-brand-forest/10 bg-white px-4 py-3.5 text-sm font-medium text-brand-forest transition hover:border-brand-emerald hover:bg-brand-mint disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-emerald-100"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mint text-brand-emerald dark:bg-white/5"><Icon className="h-4 w-4" aria-hidden="true" /></span>
            <span className="font-display">{label}</span>
          </span>
          <span className="font-display font-semibold">{loadingOption === key ? '…' : `${price} €`}</span>
        </button>
      ) : null)}

      {prices.pack && (
        <button
          onClick={() => handlePayment('pack')}
          disabled={loadingOption !== null}
          className="relative mt-2 flex w-full items-center justify-between rounded-2xl bg-brand-forest px-4 py-4 text-sm text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-emerald disabled:opacity-50"
        >
          <span className="absolute -top-2.5 right-4 rounded-full bg-amber-400 px-2.5 py-0.5 font-display text-[length:calc(10px*var(--text-scale,1))] font-semibold text-brand-forest">Recommandé</span>
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Package className="h-4 w-4" aria-hidden="true" /></span>
            <span className="text-left">
              <span className="block font-display font-semibold">Pack complet</span>
              <span className="block text-xs text-emerald-100/80">Vidéo + PDF</span>
            </span>
          </span>
          <span className="font-display text-base font-semibold">{loadingOption === 'pack' ? '…' : `${prices.pack} €`}</span>
        </button>
      )}

      {errorMsg && (
        <p role="alert" className="mt-2 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {errorMsg}
        </p>
      )}

      <p className="mt-3 text-center text-xs text-brand-muted">Paiement sécurisé par Stripe · Accès à vie</p>
    </div>
  );
}
