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
    <section className="container-page pt-4">
      <div className="relative isolate overflow-hidden rounded-5xl bg-brand-forest text-white shadow-float">
        <Artwork item={item} shared size="hero" fill className="-z-10" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-forest via-brand-forest/90 to-brand-forest/20" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-brand-forest to-transparent" />

        <div className="flex min-h-[560px] flex-col p-8 sm:p-12 lg:p-16">
          <Link
            href={backHref}
            transitionTypes={['nav-back']}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-display text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {backLabel}
          </Link>

          <div className="mt-auto max-w-2xl pt-16">
            <div className="flex flex-wrap items-center gap-2">{tags}</div>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              <ViewTransition name={titleTransitionName(item)} share="morph" default="none">
                <span>{item.title}</span>
              </ViewTransition>
            </h1>

            {item.summary && (
              <p className="mt-5 line-clamp-4 max-w-xl text-base leading-relaxed text-emerald-50/85 sm:text-lg">{item.summary}</p>
            )}

            <dl className="mt-7 flex flex-wrap gap-3">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur">
                  <span className="text-emerald-300" aria-hidden="true">{fact.icon}</span>
                  <div>
                    <dt className="text-[11px] text-emerald-100/70">{fact.label}</dt>
                    <dd className="font-display text-sm font-semibold text-white">{fact.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Étiquettes claires utilisées dans le hero */
export function HeroTag({ children, tone = 'glass' }: { children: ReactNode; tone?: 'glass' | 'solid' | 'amber' }) {
  const styles = {
    glass: 'bg-white/15 text-white backdrop-blur',
    solid: 'bg-white/95 text-brand-forest',
    amber: 'bg-amber-300 text-brand-forest',
  }[tone];
  return <span className={`chip ${styles}`}>{children}</span>;
}
