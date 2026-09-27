import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Actualités',
  description: "Les dernières nouvelles, sessions et temps forts de l'Académie E.S.I.C.",
};

// TODO(API) : remplacer actualitesDemo par l'appel à l'API Symfony (ex: GET /api/actualites)
const actualitesDemo = [
  {
    date: "Septembre 2026",
    titre: "Ouverture des inscriptions pour la nouvelle session",
    resume: "Les inscriptions pour l'Institut Biblique Théologique et l'École du Ministère sont désormais ouvertes. Places limitées pour un accompagnement de qualité.",
  },
  {
    date: "Août 2026",
    titre: "Nouvelle formation en Leadership chrétien",
    resume: "Un nouveau programme dédié à la formation de leaders spirituels compétents fait son entrée à l'Académie dès la rentrée.",
  },
  {
    date: "Juillet 2026",
    titre: "Session de graduation 2026",
    resume: "Retour en images sur la cérémonie de graduation qui a célébré l'engagement de nos étudiants tout au long de l'année.",
  },
];

export default function ActualitesPage() {
  return (
    <div className="overflow-x-hidden">
      <PageHeader
        eyebrow="À la une"
        title="Actualités de l'Académie"
        lead="Suivez les dernières nouvelles, sessions et temps forts de l'Académie E.S.I.C."
      />

      <section className="container-page py-20">
        <ol className="relative mx-auto max-w-3xl space-y-6 before:absolute before:bottom-6 before:left-7 before:top-6 before:w-px before:bg-brand-sage">
          {actualitesDemo.map((a) => (
            <li key={a.titre} className="relative flex gap-6">
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-forest text-white shadow-soft" aria-hidden="true">
                <CalendarDays className="h-6 w-6" />
              </span>
              <article className="card-hover flex-1 p-7">
                <p className="font-display text-xs font-semibold text-brand-emerald">{a.date}</p>
                <h2 className="mt-2 font-display text-lg font-semibold text-brand-forest">{a.titre}</h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{a.resume}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
