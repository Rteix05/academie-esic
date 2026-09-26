'use client';

import { useState } from 'react';
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
  const [loadingOption, setLoadingOption] = useState<string | null>(null);

  const handlePayment = async (option: 'pdf' | 'video' | 'pack') => {
    setLoadingOption(option);
    try {
      // On envoie l'ID ET l'option choisie au backend (session via cookie httpOnly)
      const res = await apiFetch(`/api/stripe/checkout/${masterclassId}/${option}`, { method: 'POST' });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
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
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Stripe error:', error);
      alert(error instanceof Error ? error.message : "Impossible de joindre la passerelle de paiement.");
    } finally {
      setLoadingOption(null);
    }
  };

  const hasAnyPrice = prices.pdf || prices.video || prices.pack;

  if (!hasAnyPrice) {
    return (
      <div className="flex items-start gap-2 text-gray-400 text-xs mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Les tarifs ne sont pas encore renseignés pour cette masterclass.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Choisir votre option :</p>
      
      {prices.pdf && (
        <button
          onClick={() => handlePayment('pdf')}
          disabled={loadingOption !== null}
          className="w-full py-2 px-4 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 text-[#0F291E] text-xs font-bold rounded-xl flex justify-between items-center transition disabled:opacity-50"
        >
          <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> PDF Seul</span>
          <span>{loadingOption === 'pdf' ? '...' : `${prices.pdf} €`}</span>
        </button>
      )}

      {prices.video && (
        <button
          onClick={() => handlePayment('video')}
          disabled={loadingOption !== null}
          className="w-full py-2 px-4 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 text-[#0F291E] text-xs font-bold rounded-xl flex justify-between items-center transition disabled:opacity-50"
        >
          <span className="flex items-center gap-2"><Video className="w-3.5 h-3.5" /> Vidéo Seule</span>
          <span>{loadingOption === 'video' ? '...' : `${prices.video} €`}</span>
        </button>
      )}

      {prices.pack && (
        <button
          onClick={() => handlePayment('pack')}
          disabled={loadingOption !== null}
          className="w-full py-2.5 px-4 bg-[#0F291E] hover:bg-emerald-950 text-white text-xs font-black rounded-xl flex justify-between items-center transition shadow-lg shadow-emerald-950/10 disabled:opacity-50"
        >
          <span className="flex items-center gap-2"><Package className="w-3.5 h-3.5" /> Pack Complet (Vidéo + PDF)</span>
          <span>{loadingOption === 'pack' ? '...' : `${prices.pack} €`}</span>
        </button>
      )}
    </div>
  );
}