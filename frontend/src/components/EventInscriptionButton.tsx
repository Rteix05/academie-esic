'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Props {
  eventId: number;
  price: number;
  isFull: boolean;
}

export default function EventInscriptionButton({ eventId, price, isFull: initialFull }: Props) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFull, setIsFull] = useState(initialFull);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Le cookie de session (s'il existe) indique si l'utilisateur est déjà inscrit
    apiFetch(`/api/events/${eventId}/status`)
      .then((r): Promise<Partial<{ isRegistered: boolean; isFull: boolean; spotsLeft: number | null }>> => r.ok ? r.json() : Promise.resolve({}))
      .then(data => {
        setIsRegistered(data.isRegistered ?? false);
        setIsFull(data.isFull ?? initialFull);
        setSpotsLeft(data.spotsLeft ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId, initialFull]);

  if (loading) return <div className="h-12 rounded-xl bg-gray-100 animate-pulse w-full" />;

  if (isRegistered) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-full py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Inscrit
        </div>
        <Link href="/dashboard" className="text-xs text-center text-emerald-600 hover:underline">
          Voir dans mon espace →
        </Link>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="w-full py-3.5 bg-red-50 border border-red-200 text-red-600 text-sm font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
        <Users className="w-4 h-4" /> Complet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {spotsLeft !== null && spotsLeft <= 5 && (
        <p className="text-xs text-amber-600 font-semibold text-center">
          ⚠ Plus que {spotsLeft} place{spotsLeft > 1 ? 's' : ''} !
        </p>
      )}
      <Link
        href={`/evenements/${eventId}/inscription`}
        className="w-full py-3.5 bg-[#0F291E] text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-900 transition text-center shadow-lg shadow-emerald-900/20"
      >
        {price === 0 ? "S'inscrire gratuitement" : `S'inscrire — ${price.toFixed(2)} €`}
      </Link>
    </div>
  );
}
