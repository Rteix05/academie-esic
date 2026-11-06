import type { Metadata } from 'next';
import { PHOTOS } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Crédits photographiques',
  description: 'Auteurs et licences des photographies utilisées sur le site.',
  alternates: { canonical: '/credits-photos' },
};

export default function CreditsPhotosPage() {
  return (
    <div className="container-page py-16 sm:py-20">
      <h1 className="section-title">Crédits photographiques</h1>
      <p className="section-lead">
        Les photographies du site proviennent de Wikimedia Commons et sont utilisées selon leur licence.
      </p>

      <ul className="mt-12 max-w-3xl divide-y divide-brand-forest/10 border-y border-brand-forest/10 dark:divide-white/10 dark:border-white/10">
        {Object.values(PHOTOS).map((photo) => (
          <li key={photo.src} className="py-5">
            <p className="font-medium text-brand-forest">{photo.alt}</p>
            <p className="mt-1 text-base text-brand-muted">
              Photo : {photo.credit.by} ·{' '}
              <a href={photo.credit.licenceUrl} target="_blank" rel="noopener noreferrer" className="link">
                {photo.credit.licence}<span className="sr-only"> (nouvelle fenêtre)</span>
              </a>{' '}
              ·{' '}
              <a href={photo.credit.page} target="_blank" rel="noopener noreferrer" className="link">
                Source<span className="sr-only"> : Wikimedia Commons (nouvelle fenêtre)</span>
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
