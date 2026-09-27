import { ViewTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';
import Artwork from './Artwork';
import { titleTransitionName, type CatalogItem } from '@/lib/catalog';

/**
 * Carte compacte d'un carrousel. `shared` : cette carte porte les noms de transition
 * (visuel + titre) qui se transforment en hero sur la page détail.
 */
export function ContentCard({ item, shared = false, fluid = false }: { item: CatalogItem; shared?: boolean; /** Occupe la largeur de sa cellule (grille) au lieu de la largeur fixe du carrousel */ fluid?: boolean }) {
  const title = <span className="line-clamp-2">{item.title}</span>;

  return (
    <Link
      href={item.href}
      transitionTypes={['nav-forward']}
      className={`group block rounded-4xl focus-visible:outline-offset-4 ${fluid ? "w-full" : "w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-[280px]"}`}
    >
      <div className="relative overflow-hidden rounded-3xl shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-soft">
        <Artwork item={item} shared={shared} className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {item.category && <span className="chip max-w-[70%] truncate bg-white/95 shadow-card">{item.category}</span>}
          {item.badge && (
            <span className="chip shrink-0 bg-amber-300 text-brand-forest">
              {item.badge}
            </span>
          )}
        </div>
      </div>

      <div className="px-1 pt-4">
        <h3 className="font-display text-base font-semibold leading-snug text-brand-forest transition-colors group-hover:text-brand-emerald">
          {shared ? <ViewTransition name={titleTransitionName(item)} share="morph" default="none">{title}</ViewTransition> : title}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-brand-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            {item.author ? (<><User className="h-3.5 w-3.5 shrink-0 text-brand-emerald" aria-hidden="true" /><span className="truncate">{item.author}</span></>) : item.meta.join(' · ')}
          </span>
          <span className="shrink-0 font-display text-sm font-semibold text-brand-forest">{item.priceLabel}</span>
        </div>
      </div>
    </Link>
  );
}

/** Première carte d'une rangée, mise en avant : plus large, texte sur le visuel */
export function FeaturedCard({ item, shared = false }: { item: CatalogItem; shared?: boolean }) {
  const title = <span className="line-clamp-2">{item.title}</span>;

  return (
    <Link
      href={item.href}
      transitionTypes={['nav-forward']}
      className="group relative block w-[86vw] max-w-[560px] shrink-0 snap-start overflow-hidden rounded-4xl shadow-soft focus-visible:outline-offset-4 sm:w-[520px]"
    >
      <Artwork item={item} shared={shared} size="feature" className="aspect-[16/10] transition-transform duration-700 group-hover:scale-[1.03] sm:aspect-[16/9]" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-forest via-brand-forest/60 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-white/95">À la une</span>
          {item.category && <span className="chip bg-white/15 text-white backdrop-blur">{item.category}</span>}
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">
          {shared ? <ViewTransition name={titleTransitionName(item)} share="morph" default="none">{title}</ViewTransition> : title}
        </h3>
        {item.summary && <p className="mt-2 line-clamp-2 max-w-md text-sm text-emerald-50/85">{item.summary}</p>}
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-display text-lg font-semibold">{item.priceLabel}</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-forest transition-transform group-hover:translate-x-1" aria-hidden="true">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
