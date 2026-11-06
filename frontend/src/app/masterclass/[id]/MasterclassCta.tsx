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
    return <div className="h-14 w-60 rounded-full bg-brand-forest/[0.06]" aria-hidden="true" />;
  }

  if (owned) {
    return (
      <a href="#acces" className="btn-primary">
        <PlayCircle className="h-5 w-5" aria-hidden="true" /> Accéder à l&apos;enseignement
        <span className="btn-icon"><ArrowDown className="h-4 w-4" aria-hidden="true" /></span>
      </a>
    );
  }

  if (fromPrice === null) {
    return <span className="btn cursor-not-allowed border border-brand-forest/15 text-brand-muted">Bientôt disponible</span>;
  }

  return (
    <a href="#acces" className="btn-primary">
      <Lock className="h-4 w-4" aria-hidden="true" /> Débloquer — dès {fromPrice} €
      <span className="btn-icon"><ArrowDown className="h-4 w-4" aria-hidden="true" /></span>
    </a>
  );
}
