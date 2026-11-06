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
        lead="Les nouvelles, sessions et temps forts de l'Académie E.S.I.C."
      />

      <section className="container-page py-20">
        {actualites.length === 0 ? (
          <EmptyState icon={<CalendarDays className="h-6 w-6" />} title="Aucune actualité pour le moment">
            Les prochaines sessions et temps forts de l&apos;Académie seront annoncés ici.
          </EmptyState>
        ) : (
        <ol className="max-w-3xl divide-y divide-brand-forest/10 border-y border-brand-forest/10 dark:divide-white/10 dark:border-white/10">
          {actualites.map((a) => (
            <li key={a.id}>
              <article className="grid gap-2 py-8 sm:grid-cols-[10rem_1fr] sm:gap-8">
                <p className="text-base text-brand-emerald"><time dateTime={a.publishedAt}>{formatNewsDate(a.publishedAt)}</time></p>
                <div>
                  <h2 className="font-display text-2xl font-medium text-brand-forest">{a.title}</h2>
                  <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-brand-muted">{a.summary}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
        )}
      </section>
    </div>
  );
}
