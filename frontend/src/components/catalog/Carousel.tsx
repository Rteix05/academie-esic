'use client';

import { useId, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ContentCard } from './ContentCard';
import type { CatalogItem } from '@/lib/catalog';

/** Nombre de cartes affichées avant « Voir les N » (deux rangées de quatre) */
export const VISIBLE_ITEMS = 8;

/**
 * Rangée d'un catalogue : titre, nombre de contenus, puis une grille de cartes (4 par ligne sur grand écran).
 * Au-delà de huit contenus, un bouton déplie le reste sur place. Aucun défilement horizontal.
 * (Le nom « Carousel » est conservé pour ne pas changer les imports.)
 */
export default function Carousel({
  id,
  title,
  subtitle,
  items,
  sharedIds,
  action,
  icon,
  hideTitle = false,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  items: CatalogItem[];
  /** Ancienne option (première carte agrandie) : sans effet dans la grille */
  featureFirst?: boolean;
  /** Identifiants dont la carte porte la transition partagée vers la page détail */
  sharedIds?: Set<string>;
  action?: { href: string; label: string };
  icon?: ReactNode;
  /** Titre lu par les lecteurs d'écran seulement (la section a déjà son titre visible) */
  hideTitle?: boolean;
}) {
  const headingId = useId();
  const gridId = useId();
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const isShared = (item: CatalogItem) => sharedIds?.has(`${item.kind}-${item.id}`) ?? false;
  const visible = expanded ? items : items.slice(0, VISIBLE_ITEMS);
  const hidden = items.length - VISIBLE_ITEMS;

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-28">
      <div className={hideTitle ? 'sr-only' : 'flex flex-wrap items-end justify-between gap-4'}>
        <div className="min-w-0">
          <h2 id={headingId} className="flex items-center gap-3 font-display text-xl font-medium text-brand-forest sm:text-2xl">
            {icon && <span className="icon-tile h-9 w-9 rounded-lg" aria-hidden="true">{icon}</span>}
            {title}
            <span className="text-base font-normal text-brand-muted">{items.length}</span>
          </h2>
          {subtitle && <p className="mt-1 text-base text-brand-muted">{subtitle}</p>}
        </div>
        {action && (
          <Link href={action.href} className="btn-secondary">
            {action.label}
          </Link>
        )}
      </div>

      <div id={gridId} role="list" className={`${hideTitle ? '' : 'mt-6'} grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
        {visible.map((item) => (
          <div role="listitem" key={`${item.kind}-${item.id}`}>
            <ContentCard item={item} shared={isShared(item)} fluid />
          </div>
        ))}
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls={gridId}
          className="btn-secondary mt-8 w-full sm:w-auto"
        >
          {expanded
            ? <>Afficher moins <ChevronUp className="h-4 w-4" aria-hidden="true" /></>
            : <>Voir les {hidden} autres <ChevronDown className="h-4 w-4" aria-hidden="true" /></>}
        </button>
      )}
    </section>
  );
}

/** Rangée fantôme pendant le chargement */
export function CarouselSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-7 w-56 rounded-lg bg-brand-forest/[0.06] dark:bg-white/10" />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[16/10] rounded-3xl bg-brand-forest/[0.06] dark:bg-white/5" />
            <div className="mt-4 h-4 w-3/4 rounded bg-brand-forest/[0.06] dark:bg-white/5" />
            <div className="mt-2 h-3 w-1/2 rounded bg-brand-forest/[0.05] dark:bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const itemKey = (item: Pick<CatalogItem, 'kind' | 'id'>) => `${item.kind}-${item.id}`;

/**
 * Attribue les transitions partagées : un seul élément par contenu et par page
 * (sa première apparition, dans l'ordre d'affichage), sinon le navigateur ne peut pas
 * savoir quelle carte doit se transformer en hero.
 *
 * @param rows      rangées dans l'ordre d'affichage
 * @param alreadyUsed contenus déjà pris (ex. l'élément du bandeau « À la une »)
 * @returns pour chaque clé de rangée, les contenus dont elle porte la transition
 */
export function assignSharedIds(
  rows: { key: string; items: CatalogItem[] }[],
  alreadyUsed: Iterable<string> = [],
): Map<string, Set<string>> {
  const seen = new Set(alreadyUsed);
  const owned = new Map<string, Set<string>>();
  for (const row of rows) {
    const mine = new Set<string>();
    for (const item of row.items) {
      const key = itemKey(item);
      if (!seen.has(key)) {
        seen.add(key);
        mine.add(key);
      }
    }
    owned.set(row.key, mine);
  }
  return owned;
}
