import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/ui';
import { fetchNews, formatNewsDate } from '@/lib/news';

export const metadata: Metadata = {
  title: 'Actualités',
  description: "Les dernières nouvelles, sessions et temps forts de l'Académie E.S.I.C.",
};

// Actualités saisies dans l'admin, rafraîchies toutes les 5 minutes
export const revalidate = 300;

export default async function ActualitesPage() {
  const actualites = await fetchNews();

  return (
    <div className="overflow-x-hidden">
      <PageHeader
        eyebrow="À la une"
        title="Actualités de l'Académie"
        lead="Suivez les dernières nouvelles, sessions et temps forts de l'Académie E.S.I.C."
      />

      <section className="container-page py-20">
        {actualites.length === 0 ? (
          <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="Aucune actualité pour le moment">
            Les prochaines sessions et temps forts de l&apos;Académie seront annoncés ici.
          </EmptyState>
        ) : (
        <ol className="relative mx-auto max-w-3xl space-y-6 before:absolute before:bottom-6 before:left-7 before:top-6 before:w-px before:bg-brand-sage">
          {actualites.map((a) => (
            <li key={a.id} className="relative flex gap-6">
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-forest text-white shadow-soft" aria-hidden="true">
                <CalendarDays className="h-6 w-6" />
              </span>
              <article className="card-hover flex-1 p-7">
                <p className="font-display text-xs font-semibold text-brand-emerald"><time dateTime={a.publishedAt}>{formatNewsDate(a.publishedAt)}</time></p>
                <h2 className="mt-2 font-display text-lg font-semibold text-brand-forest">{a.title}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-muted">{a.summary}</p>
              </article>
            </li>
          ))}
        </ol>
        )}
      </section>
    </div>
  );
}
