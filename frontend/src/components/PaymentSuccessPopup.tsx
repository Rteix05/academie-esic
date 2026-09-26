'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, X, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={close}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'loading' ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-sm font-bold text-[#0F291E]">Confirmation du paiement…</p>
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-[#0F291E]">Paiement confirmed !</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Votre masterclass est maintenant débloquée. Retrouvez votre contenu dans votre espace personnel.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-2 px-6 py-3 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-950 transition w-full"
            >
              Accéder à mon espace
            </button>
            <button onClick={close} className="text-xs text-gray-400 hover:text-gray-600 transition">
              Rester sur cette page
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-[#0F291E]">Paiement annulé</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Votre paiement n'a pas été complété. Aucun montant n'a été débité.
            </p>
            <button
              onClick={close}
              className="mt-2 px-6 py-3 bg-gray-100 text-[#0F291E] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-200 transition w-full"
            >
              Retour au catalogue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}