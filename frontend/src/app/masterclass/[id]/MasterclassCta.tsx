'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, Lock, PlayCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

/**
 * Appel à l'action du hero de la fiche masterclass : « Regarder » si l'enseignement
 * est débloqué, sinon « Débloquer ». Les deux mènent au bloc d'accès (#acces),
 * où se trouvent le lecteur et les options d'achat.
 */
export default function MasterclassCta({ masterclassId, fromPrice }: { masterclassId: number; fromPrice: number | null }) {
  const [owned, setOwned] = useState<boolean | null>(null);

  useEffect(() => {
    // Non connecté : 401 → non débloquée
    apiFetch('/api/mes-masterclasses')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: number }[]) => setOwned(Array.isArray(list) && list.some((m) => m.id === masterclassId)))
      .catch(() => setOwned(false));
  }, [masterclassId]);

  if (owned === null) {
    return <div className="h-14 w-60 animate-pulse rounded-full bg-white/15" aria-hidden="true" />;
  }

  if (owned) {
    return (
      <a href="#acces" className="btn bg-white py-3 pl-6 pr-2 text-brand-forest shadow-soft hover:-translate-y-0.5">
        <PlayCircle className="h-5 w-5 text-brand-emerald" aria-hidden="true" /> Accéder à l&apos;enseignement
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald text-white"><ArrowDown className="h-4 w-4" aria-hidden="true" /></span>
      </a>
    );
  }

  if (fromPrice === null) {
    return <span className="btn cursor-not-allowed bg-white/15 px-6 py-3 text-white/80">Bientôt disponible</span>;
  }

  return (
    <a href="#acces" className="btn bg-white py-3 pl-6 pr-2 text-brand-forest shadow-soft hover:-translate-y-0.5">
      <Lock className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> Débloquer — dès {fromPrice} €
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald text-white"><ArrowDown className="h-4 w-4" aria-hidden="true" /></span>
    </a>
  );
}
