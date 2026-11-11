import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Church, Globe, HandHeart, Heart, Mountain, Sparkles, TreePine } from 'lucide-react';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Biographie de Samuel Panzu',
  description:
    'Biographie institutionnelle de Samuel Panzu, fondateur de La Montagne de la Prière Ministries (MDLP) et pasteur principal de l’église La Montagne de la Prière Paris.',
  alternates: { canonical: '/biographie' },
};

// Les grandes étapes du parcours, dans l'ordre chronologique
const etapes = [
  {
    annee: '1989',
    icon: BookOpen,
    titre: 'Parcours et appel',
    texte:
      'Converti en 1989, il se distingue très tôt par une profondeur exceptionnelle dans la compréhension des Écritures. Trois mois après sa conversion, il prêche sur Osée 4:6, posant les bases d’un ministère centré sur la connaissance comme instrument de libération.',
  },
  {
    annee: '1990',
    icon: Globe,
    titre: 'Déploiement international',
    texte: 'Appelé en Europe en 1990, il s’établit en Italie après une formation en Suisse.',
  },
  {
    annee: '1995',
    icon: TreePine,
    titre: 'Fondation — Arbre de Vie Internationale',
    texte: 'En 1995, il fonde à Milan le ministère Arbre de Vie Internationale, qui devient une œuvre missionnaire majeure.',
  },
  {
    annee: '2002',
    icon: Sparkles,
    titre: 'Consécration',
    texte: 'Consacré prophète en 2002 à Milan.',
  },
  {
    annee: '2004',
    icon: HandHeart,
    titre: 'Engagement humanitaire',
    texte: 'Fondateur de Arbre de Vie M.A.C.R.I.A (2004), devenu Secours Humanitaire International.',
    points: ['800 bénéficiaires mensuels', 'Boutiques solidaires', 'Partenariats institutionnels'],
  },
];

const expansion = [
  'Implantation de plusieurs églises en Italie',
  'Implantation à Berne (Suisse)',
  'Église de maison à Carcassonne (France)',
  'Formation de nombreux pasteurs et leaders',
];

const mission = [
  'Enseignement profond de la Parole',
  'Formation spirituelle',
  'Restauration des vies',
  'Structuration ministérielle',
];

export default function BiographiePage() {
  return (
    <div className="overflow-x-hidden">
      <PageHeader
        eyebrow="Biographie institutionnelle"
        title="Samuel Panzu"
        lead="Fondateur de La Montagne de la Prière Ministries (MDLP) et pasteur principal de l’église La Montagne de la Prière Paris."
      />

      {/* ── PRÉSENTATION GÉNÉRALE ────────────────────────────────────────── */}
      <section className="container-page py-20">
        <div className="card mx-auto flex max-w-4xl flex-col gap-6 p-8 sm:flex-row sm:items-start sm:p-10">
          <span className="icon-tile shrink-0"><Mountain className="h-6 w-6" aria-hidden="true" /></span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-forest">Présentation générale</h2>
            <p className="mt-3 leading-relaxed text-brand-muted">
              Samuel Panzu est le fondateur de La Montagne de la Prière Ministries (MDLP) et le pasteur principal de l’église
              La Montagne de la Prière Paris. Il exerce un ministère prophétique et apostolique au service de Jésus-Christ
              depuis plus de trente ans.
            </p>
          </div>
        </div>
      </section>

      {/* ── PARCOURS (FRISE) ─────────────────────────────────────────────── */}
      <section className="bg-brand-mint py-20 dark:bg-[#0f1f16]">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow bg-white dark:bg-white/5">Parcours</span>
            <h2 className="section-title mt-4">Plus de trente ans de ministère</h2>
          </div>

          <ol className="relative mx-auto mt-12 max-w-3xl space-y-6 before:absolute before:bottom-6 before:left-7 before:top-6 before:w-px before:bg-brand-sage dark:before:bg-white/10">
            {etapes.map(({ annee, icon: Icon, titre, texte, points }) => (
              <li key={titre} className="relative flex gap-6">
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-forest text-white shadow-soft" aria-hidden="true">
                  <Icon className="h-6 w-6" />
                </span>
                <article className="card flex-1 p-7">
                  <p className="font-display text-sm font-semibold text-brand-emerald">{annee}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-brand-forest">{titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{texte}</p>
                  {points && (
                    <ul className="mt-4 space-y-2">
                      {points.map((p) => (
                        <li key={p} className="flex gap-2 text-sm text-brand-ink">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-emerald" aria-hidden="true" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── EXPANSION & FORMATION / MISSION ACTUELLE ─────────────────────── */}
      <section className="container-page grid gap-6 py-20 md:grid-cols-2">
        <div className="card p-8 sm:p-10">
          <span className="icon-tile"><Church className="h-6 w-6" aria-hidden="true" /></span>
          <h2 className="mt-6 font-display text-2xl font-semibold text-brand-forest">Expansion et formation</h2>
          <p className="mt-2 text-sm text-brand-muted">Sous son leadership :</p>
          <ul className="mt-4 space-y-3">
            {expansion.map((e) => (
              <li key={e} className="flex gap-3 text-sm leading-relaxed text-brand-ink">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-emerald" aria-hidden="true" />
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-8 sm:p-10">
          <span className="icon-tile"><BookOpen className="h-6 w-6" aria-hidden="true" /></span>
          <h2 className="mt-6 font-display text-2xl font-semibold text-brand-forest">Mission actuelle</h2>
          <ul className="mt-6 space-y-3">
            {mission.map((m) => (
              <li key={m} className="flex gap-3 text-sm leading-relaxed text-brand-ink">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-emerald" aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── VIE FAMILIALE ────────────────────────────────────────────────── */}
      <section className="container-page pb-20">
        <div className="card mx-auto flex max-w-4xl flex-col gap-6 p-8 sm:flex-row sm:items-start sm:p-10">
          <span className="icon-tile shrink-0"><Heart className="h-6 w-6" aria-hidden="true" /></span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-forest">Vie familiale</h2>
            <p className="mt-3 leading-relaxed text-brand-muted">
              Marié à Filomena Panzu depuis près de 26 ans, père de quatre enfants.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/histoire" className="btn-secondary">
            Découvrir l&apos;Académie <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
