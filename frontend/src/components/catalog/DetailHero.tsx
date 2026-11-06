import { ViewTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Artwork from './Artwork';
import { titleTransitionName, type CatalogItem } from '@/lib/catalog';

/**
 * Hero des pages détail : même visuel et même titre que la carte cliquée dans le
 * catalogue (transitions partagées), pour donner l'impression d'« ouvrir » le contenu.
 */
export default function DetailHero({
  item,
  backHref,
  backLabel,
  tags,
  facts,
  actions,
}: {
  item: CatalogItem;
  backHref: string;
  backLabel: string;
  tags: ReactNode;
  /** Informations essentielles (durée, niveau, prix…) */
  facts: { icon: ReactNode; label: string; value: ReactNode }[];
  actions: ReactNode;
}) {
  return (
    <section className="border-b border-brand-forest/10 dark:border-white/10">
      <div className="container-page py-10 sm:py-14">
        <Link
          href={backHref}
          transitionTypes={['nav-back']}
          className="inline-flex min-h-11 items-center gap-2 text-base text-brand-muted underline-offset-4 transition-colors hover:text-brand-forest hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {backLabel}
        </Link>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2">{tags}</div>

            <h1 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-brand-forest sm:text-5xl">
              <ViewTransition name={titleTransitionName(item)} share="morph" default="none">
                <span>{item.title}</span>
              </ViewTransition>
            </h1>

            {item.summary && (
              <p className="mt-5 line-clamp-4 max-w-xl text-lg leading-relaxed text-brand-muted">{item.summary}</p>
            )}

            <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 border-y border-brand-forest/10 py-5 sm:grid-cols-4 dark:border-white/10">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="flex items-center gap-1.5 text-sm text-brand-muted">
                    <span className="text-brand-emerald" aria-hidden="true">{fact.icon}</span>
                    {fact.label}
                  </dt>
                  <dd className="mt-1 font-display text-base font-medium text-brand-forest">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{actions}</div>
          </div>

          <div className="overflow-hidden rounded-4xl lg:col-span-6">
            <Artwork item={item} shared size="feature" className="aspect-[4/3]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Étiquettes du hero (type de contenu, catégorie, formats) */
export function HeroTag({ children, tone = 'glass' }: { children: ReactNode; tone?: 'glass' | 'solid' | 'amber' }) {
  const styles = {
    glass: 'bg-brand-forest/[0.05] text-brand-forest dark:bg-white/10 dark:text-emerald-100',
    solid: 'bg-brand-mint text-brand-forest',
    amber: 'bg-amber-100 text-amber-900',
  }[tone];
  return <span className={`chip ${styles}`}>{children}</span>;
}
