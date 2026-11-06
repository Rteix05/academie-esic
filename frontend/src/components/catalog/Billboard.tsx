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
    <section className="border-b border-brand-forest/10 dark:border-white/10" aria-label="À la une">
      <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-6">
          <p className="eyebrow">{eyebrow}{item.category && <span className="text-brand-muted"> · {item.category}</span>}</p>

          <h2 className="mt-3 font-display text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-brand-forest sm:text-5xl">
            <ViewTransition name={titleTransitionName(item)} share="morph" default="none">
              <span>{item.title}</span>
            </ViewTransition>
          </h2>

          {item.summary && <p className="mt-5 line-clamp-3 max-w-xl text-lg leading-relaxed text-brand-muted">{item.summary}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-brand-muted">
            {item.author && <span className="flex items-center gap-2"><User className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> {item.author}</span>}
            {item.meta.length > 0 && (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-emerald" aria-hidden="true" />
                {item.meta.join(' · ')}
              </span>
            )}
            <span className="font-display text-lg font-medium text-brand-forest">{item.priceLabel}</span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={item.href} transitionTypes={['nav-forward']} className="btn-primary">
              {item.kind === 'masterclass' ? 'Voir la masterclass' : 'Voir la formation'}
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
            <a href="#catalogue" className="btn-secondary">
              {catalogLabel}
            </a>
          </div>
        </div>

        <Link href={item.href} transitionTypes={['nav-forward']} tabIndex={-1} aria-hidden="true" className="group block overflow-hidden rounded-4xl lg:col-span-6">
          <Artwork item={item} shared size="feature" className="aspect-[4/3] transition-transform duration-[600ms] group-hover:scale-[1.03]" />
        </Link>
      </div>
    </section>
  );
}

/** Bandeau fantôme pendant le chargement du catalogue (évite un saut de mise en page) */
export function BillboardSkeleton() {
  return (
    <section className="border-b border-brand-forest/10 dark:border-white/10" aria-hidden="true">
      <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-6">
          <div className="h-4 w-40 rounded bg-brand-forest/[0.06] dark:bg-white/10" />
          <div className="h-12 w-3/4 rounded-lg bg-brand-forest/[0.06] dark:bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-brand-forest/[0.05] dark:bg-white/10" />
          <div className="h-11 w-44 rounded-full bg-brand-forest/[0.06] dark:bg-white/10" />
        </div>
        <div className="aspect-[4/3] rounded-4xl bg-brand-forest/[0.06] lg:col-span-6 dark:bg-white/5" />
      </div>
    </section>
  );
}
