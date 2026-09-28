import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { PageHeader } from '@/components/ui';

// Page masquée : retirée du menu, du pied de page, du plan du site et du sitemap,
// et non indexée tant que les témoignages sont des données de démonstration.
// Pour la publier : retirer `robots` ci-dessous et rétablir les liens (Navbar, lib/siteMap.ts, sitemap.ts).
export const metadata: Metadata = {
  title: 'Témoignages',
  description: "Des récits d'étudiants sur l'impact des formations de l'Académie E.S.I.C.",
  robots: { index: false, follow: false },
};

// TODO(API) : remplacer temoignagesDemo par l'appel à l'API Symfony (ex: GET /api/temoignages)
const temoignagesDemo = [
  {
    nom: "Ruth M.",
    initiales: "RM",
    formation: "Institut Biblique Théologique",
    citation: "Cette formation a changé ma manière de lire la Bible et de vivre ma foi au quotidien. Chaque enseignement m'a rapprochée de Dieu et de ma vocation.",
  },
  {
    nom: "Samuel K.",
    initiales: "SK",
    formation: "École du Ministère et du Leadership",
    citation: "J'ai appris à conduire avec plus de sagesse et de discernement dans mon ministère. Un encadrement exigeant mais qui porte du fruit.",
  },
  {
    nom: "Naomi T.",
    initiales: "NT",
    formation: "Discipulat",
    citation: "Un accompagnement solide qui m'a aidée à comprendre et à assumer mon appel. Je recommande cette académie à quiconque veut grandir sérieusement dans sa foi.",
  },
  {
    nom: "David A.",
    initiales: "DA",
    formation: "Formation biblique",
    citation: "Des enseignants passionnés et un enseignement biblique rigoureux. J'ai gagné en assurance pour partager ma foi autour de moi.",
  },
];

export default function TemoignagesPage() {
  return (
    <div className="overflow-x-hidden">
      <PageHeader
        eyebrow="Ils témoignent"
        title="L'impact de nos formations"
        lead="Des récits d'étudiants qui témoignent de l'impact des formations sur leur parcours personnel, spirituel et ministériel."
      />

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {temoignagesDemo.map((t) => (
            <figure key={t.nom} className="card-hover flex flex-col p-8 sm:p-10">
              <Quote className="h-8 w-8 text-brand-emerald" aria-hidden="true" />
              <blockquote className="mt-5 flex-1 font-display text-lg leading-relaxed text-brand-forest">
                &ldquo;{t.citation}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-forest font-display text-sm font-semibold text-white ring-4 ring-brand-sage" aria-hidden="true">
                  {t.initiales}
                </span>
                <span>
                  <span className="block font-display font-semibold text-brand-forest">{t.nom}</span>
                  <span className="block text-sm text-brand-muted">{t.formation}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="font-display text-xl font-semibold text-brand-forest">Et si le prochain témoignage était le vôtre ?</p>
          <Link href="/formations" className="btn-primary mt-6">
            Découvrir les formations
            <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
