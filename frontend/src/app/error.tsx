'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-xl px-6 py-16 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-9 w-9" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-brand-forest">Une erreur est survenue</h1>
        <p className="mx-auto mt-3 max-w-md text-brand-muted">
          Nous nous excusons pour la gêne. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="btn-primary-plain">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Réessayer
          </button>
          <Link href="/" className="btn-secondary">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}
