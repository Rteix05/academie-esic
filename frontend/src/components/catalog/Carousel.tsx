'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { ContentCard, FeaturedCard } from './ContentCard';
import type { CatalogItem } from '@/lib/catalog';

/** En dessous de ce nombre, pas de carrousel : les cartes sont simplement affichées */
export const CAROUSEL_MIN_ITEMS = 3;
/** À partir de ce nombre, la rangée propose « Voir tout » (dépliage en grille) */
export const VIEW_ALL_MIN_ITEMS = 5;

/**
 * Rangée d'un catalogue :
 *  - 1 à 2 contenus : cartes affichées simplement (pas de carrousel forcé) ;
 *  - 3 contenus et plus : carrousel horizontal (aimantation, balayage tactile, sans barre
 *    visible, flèches desktop, indicateurs discrets) ;
 *  - 5 contenus et plus : « Voir tout » déplie la rangée en grille, sur place.
 */
export default function Carousel({
  id,
  title,
  subtitle,
  items,
  featureFirst = false,
  sharedIds,
  action,
  icon,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  items: CatalogItem[];
  /** Première carte mise en avant (plus grande), en mode carrousel uniquement */
  featureFirst?: boolean;
  /** Identifiants dont la carte porte la transition partagée vers la page détail */
  sharedIds?: Set<string>;
  action?: { href: string; label: string };
  icon?: ReactNode;
}) {
  const headingId = useId();
  const gridId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ canPrev: false, canNext: false, pages: 1, active: 0 });
  const [expanded, setExpanded] = useState(false);

  const isCarousel = items.length >= CAROUSEL_MIN_ITEMS && !expanded;
  const canViewAll = items.length >= VIEW_ALL_MIN_ITEMS;

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pages = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    const next = {
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < max - 4,
      pages,
      active: max > 0 ? Math.round((el.scrollLeft / max) * (pages - 1)) : 0,
    };
    // Évite un rendu inutile quand rien n'a changé
    setState((prev) => (prev.canPrev === next.canPrev && prev.canNext === next.canNext && prev.pages === next.pages && prev.active === next.active ? prev : next));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !isCarousel) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [measure, items.length, isCarousel]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  const isShared = (item: CatalogItem) => sharedIds?.has(`${item.kind}-${item.id}`) ?? false;

  return (
    <section id={id} aria-labelledby={headingId} className="relative scroll-mt-28">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id={headingId} className="flex items-center gap-3 font-display text-lg font-semibold text-brand-forest sm:text-xl">
            {icon && <span className="icon-tile h-8 w-8 rounded-xl" aria-hidden="true">{icon}</span>}
            {title}
            <span className="rounded-full bg-brand-mint px-2.5 py-0.5 font-display text-xs font-medium text-brand-muted dark:bg-white/5">{items.length}</span>
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-brand-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {action && (
            <Link href={action.href} className="hidden items-center gap-1.5 font-display text-sm font-semibold text-brand-emerald hover:underline sm:inline-flex">
              {action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          {canViewAll && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-controls={gridId}
              className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-brand-emerald hover:underline"
            >
              {expanded ? <>Réduire <ChevronUp className="h-4 w-4" aria-hidden="true" /></> : <>Voir tout <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
            </button>
          )}
          {isCarousel && state.pages > 1 && (
            <div className="hidden gap-2 md:flex">
              <ArrowButton direction={-1} disabled={!state.canPrev} onClick={() => scrollByPage(-1)} />
              <ArrowButton direction={1} disabled={!state.canNext} onClick={() => scrollByPage(1)} />
            </div>
          )}
        </div>
      </div>

      {isCarousel ? (
        <>
          <div className="relative">
            {/* Fondus latéraux indiquant qu'il reste du contenu */}
            <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-brand-cream to-transparent transition-opacity dark:from-[#0a1810] ${state.canPrev ? 'opacity-100' : 'opacity-0'}`} />
            <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-brand-cream to-transparent transition-opacity dark:from-[#0a1810] ${state.canNext ? 'opacity-100' : 'opacity-0'}`} />

            <div
              id={gridId}
              ref={trackRef}
              role="list"
              className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto scroll-smooth px-5 pb-2 pt-4 sm:-mx-8 sm:scroll-px-8 sm:px-8"
            >
              {items.map((item, index) => (
                <div role="listitem" key={`${item.kind}-${item.id}`} className="shrink-0">
                  {featureFirst && index === 0
                    ? <FeaturedCard item={item} shared={isShared(item)} />
                    : <ContentCard item={item} shared={isShared(item)} />}
                </div>
              ))}
            </div>
          </div>

          {/* Indicateurs discrets */}
          {state.pages > 1 && (
            <div aria-hidden="true" className="mt-1 flex justify-center gap-1.5">
              {Array.from({ length: state.pages }, (_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === state.active ? 'w-6 bg-brand-emerald' : 'w-1.5 bg-brand-forest/15 dark:bg-white/20'}`} />
              ))}
            </div>
          )}
        </>
      ) : (
        // Peu de contenus (ou rangée dépliée) : grille simple, sans défilement
        <div id={gridId} role="list" className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div role="listitem" key={`${item.kind}-${item.id}`}>
              <ContentCard item={item} shared={isShared(item)} fluid />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ArrowButton({ direction, disabled, onClick }: { direction: 1 | -1; disabled: boolean; onClick: () => void }) {
  const Icon = direction === 1 ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 1 ? 'Faire défiler vers la droite' : 'Faire défiler vers la gauche'}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-forest shadow-card transition hover:bg-brand-forest hover:text-white disabled:pointer-events-none disabled:opacity-30 dark:bg-white/10 dark:text-emerald-100"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

/** Rangée fantôme pendant le chargement */
export function CarouselSkeleton({ featureFirst = false }: { featureFirst?: boolean }) {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="h-7 w-56 rounded-full bg-brand-sage/60 dark:bg-white/10" />
      <div className="no-scrollbar -mx-5 mt-4 flex gap-5 overflow-hidden px-5 sm:-mx-8 sm:px-8">
        {featureFirst && <div className="aspect-[16/9] w-[86vw] max-w-[560px] shrink-0 rounded-4xl bg-brand-sage/50 sm:w-[520px] dark:bg-white/5" />}
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-[72vw] max-w-[300px] shrink-0 sm:w-[280px]">
            <div className="aspect-[16/10] rounded-3xl bg-brand-sage/50 dark:bg-white/5" />
            <div className="mt-4 h-4 w-3/4 rounded-full bg-brand-sage/50 dark:bg-white/5" />
            <div className="mt-2 h-3 w-1/2 rounded-full bg-brand-sage/40 dark:bg-white/5" />
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
