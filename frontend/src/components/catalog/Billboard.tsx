import { ViewTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, User } from 'lucide-react';
import Artwork from './Artwork';
import { titleTransitionName, type CatalogItem } from '@/lib/catalog';

/**
 * Grand bandeau « À la une » en tête de catalogue : le contenu mis en avant,
 * avec son visuel en fond. Porte la transition partagée de son contenu.
 */
export default function Billboard({ item, eyebrow, catalogLabel }: { item: CatalogItem; eyebrow: string; catalogLabel: string }) {
  return (
    <section className="container-page pt-4" aria-label="À la une">
      <div className="relative isolate min-h-[480px] overflow-hidden rounded-5xl bg-brand-forest text-white shadow-float sm:min-h-[520px]">
        <Artwork item={item} shared size="hero" fill className="-z-10" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-forest via-brand-forest/85 to-brand-forest/10" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-brand-forest/80 to-transparent" />

        <div className="flex min-h-[480px] max-w-2xl flex-col justify-end p-8 sm:min-h-[520px] sm:p-12 lg:p-16">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-white/95">{eyebrow}</span>
            {item.category && <span className="chip bg-white/15 text-white backdrop-blur">{item.category}</span>}
            {item.badge && <span className="chip bg-amber-300 text-brand-forest">{item.badge}</span>}
          </div>

          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            <ViewTransition name={titleTransitionName(item)} share="morph" default="none">
              <span>{item.title}</span>
            </ViewTransition>
          </h2>

          {item.summary && <p className="mt-5 line-clamp-3 max-w-xl text-base leading-relaxed text-emerald-50/85 sm:text-lg">{item.summary}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-emerald-50/80">
            {item.author && <span className="flex items-center gap-2"><User className="h-4 w-4 text-emerald-300" aria-hidden="true" /> {item.author}</span>}
            {item.meta.length > 0 && (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                {item.meta.join(' · ')}
              </span>
            )}
            <span className="font-display text-base font-semibold text-white">{item.priceLabel}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={item.href} transitionTypes={['nav-forward']} className="btn bg-white py-3 pl-6 pr-2 text-brand-forest shadow-soft hover:-translate-y-0.5">
              Découvrir
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-emerald text-white"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
            <a href="#catalogue" className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">
              {catalogLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Bandeau fantôme pendant le chargement du catalogue (évite un saut de mise en page) */
export function BillboardSkeleton() {
  return (
    <section className="container-page pt-4" aria-hidden="true">
      <div className="flex min-h-[480px] animate-pulse flex-col justify-end gap-4 rounded-5xl bg-brand-sage/50 p-8 sm:min-h-[520px] sm:p-12 lg:p-16 dark:bg-white/5">
        <div className="h-6 w-40 rounded-full bg-white/60 dark:bg-white/10" />
        <div className="h-12 w-3/4 max-w-xl rounded-2xl bg-white/60 dark:bg-white/10" />
        <div className="h-4 w-2/3 max-w-md rounded-full bg-white/50 dark:bg-white/10" />
        <div className="mt-4 h-12 w-44 rounded-full bg-white/60 dark:bg-white/10" />
      </div>
    </section>
  );
}
