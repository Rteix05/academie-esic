import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page py-20 sm:py-28">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-brand-forest sm:text-6xl">Page introuvable</h1>
      <p className="mt-5 max-w-xl text-lg text-brand-muted">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          Revenir à l&apos;accueil
          <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </Link>
        <Link href="/formations" className="btn-secondary">Voir les formations</Link>
      </div>
    </div>
  );
}
