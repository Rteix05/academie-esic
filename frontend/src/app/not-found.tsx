import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-20 text-center dark:bg-[#10231a]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
        <div className="relative">
          <p className="font-display text-8xl font-semibold text-emerald-600 sm:text-9xl" aria-hidden="true">404</p>
          <span className="mx-auto -mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand-forest text-white shadow-float">
            <Compass className="h-9 w-9" aria-hidden="true" />
          </span>
          <h1 className="mt-8 font-display text-4xl font-semibold text-brand-forest">Page introuvable</h1>
          <p className="mx-auto mt-3 max-w-md text-brand-muted">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn-primary">
              Retour à l&apos;accueil
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
            <Link href="/formations" className="btn-secondary">Voir les formations</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
