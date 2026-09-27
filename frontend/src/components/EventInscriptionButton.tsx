'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Users } from 'lucide-react';
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

  if (loading) return <div className="h-12 w-full animate-pulse rounded-full bg-brand-sage/50" />;

  if (isRegistered) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-sage py-3.5 font-display text-sm font-semibold text-brand-forest">
          <CheckCircle className="h-4 w-4" aria-hidden="true" /> Vous êtes inscrit
        </div>
        <Link href="/dashboard" className="text-center text-sm font-medium text-brand-emerald hover:underline">
          Voir dans mon espace →
        </Link>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-red-50 py-3.5 font-display text-sm font-semibold text-red-600">
        <Users className="h-4 w-4" aria-hidden="true" /> Complet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {spotsLeft !== null && spotsLeft <= 5 && (
        <p className="rounded-full bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-700">
          Plus que {spotsLeft} place{spotsLeft > 1 ? 's' : ''} !
        </p>
      )}
      <Link href={`/evenements/${eventId}/inscription`} className="btn-primary w-full justify-between">
        {price === 0 ? "S'inscrire gratuitement" : `S'inscrire — ${price.toFixed(2)} €`}
        <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
      </Link>
    </div>
  );
}
