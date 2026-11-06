import type { Metadata } from 'next';
import { BookOpen, CheckCircle2, GraduationCap, Video, CalendarDays, Sparkles, Award, Flame } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import SitePhoto from '@/components/SitePhoto';
import { PHOTOS } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Présentation, vision, mission et valeurs de l\'Académie E.S.I.C. — École du Savoir et de l\'Intelligence Chrétienne.',
};

const valeurs = [
  { icon: BookOpen, title: 'Fidélité à la Parole de Dieu', desc: 'La Bible demeure notre référence absolue pour l\'enseignement et la vie chrétienne.' },
  { icon: Sparkles, title: 'Transformation du caractère', desc: 'Le savoir n\'a de valeur que lorsqu\'il produit une vie semblable à celle de Christ.' },
  { icon: Award,    title: 'Excellence et discipline',    desc: 'Nous servons Dieu avec rigueur, ordre et professionnalisme.' },
  { icon: Flame,    title: 'Service et impact',           desc: 'Chaque étudiant est formé pour édifier l\'Église et influencer positivement la société.' },
];

const objectifs = [
  'Former des disciples solides dans leur foi et leur connaissance des Écritures.',
  'Préparer des leaders spirituels compétents pour le service du Royaume de Dieu.',
  'Développer une compréhension théologique saine et équilibrée.',
  'Former des ministres capables d\'enseigner, de conduire et de servir avec excellence.',
  'Accompagner chaque étudiant dans la découverte et le développement de son appel.',
  'Favoriser une croissance spirituelle, intellectuelle et pratique durable.',
  'Promouvoir une culture de discipline, d\'intégrité et de responsabilité chrétienne.',
  'Contribuer à l\'expansion du Royaume de Dieu en formant des ouvriers fidèles.',
];

const approche = [
  { icon: GraduationCap, label: 'Formations', desc: 'Des modules structurés et progressifs pour approfondir la foi étape par étape.' },
  { icon: Video,         label: 'Masterclass', desc: 'Des sessions vidéo animées par des intervenants reconnus, à votre rythme.' },
  { icon: CalendarDays,  label: 'Événements', desc: 'Des temps en présentiel pour vivre la communauté et grandir ensemble.' },
];

export default function AProposPage() {
  return (
    <div>
      <PageHeader
        eyebrow="École du Savoir et de l'Intelligence Chrétienne"
        title="À propos de l'Académie"
        lead="Née d'une conviction simple : la foi grandit quand elle est nourrie, questionnée et mise en pratique."
      />

      {/* ── Présentation, vision et mission ── */}
      <section aria-labelledby="presentation-title" className="py-20 sm:py-24">
        <div className="container-page grid items-start gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <h2 id="presentation-title" className="section-title">Un centre de formation chrétienne</h2>
            <p className="section-lead">
              Dédié à l&apos;édification des disciples et à la préparation des serviteurs de Dieu, nous formons des hommes et des femmes
              enracinés dans les Écritures, transformés par le Saint-Esprit et équipés pour servir l&apos;Église et la société avec sagesse,
              excellence et intégrité.
            </p>
            <dl className="mt-10 divide-y divide-brand-forest/10 border-y border-brand-forest/10 dark:divide-white/10 dark:border-white/10">
              <div className="py-6">
                <dt className="font-display text-xl font-medium text-brand-forest">Notre vision</dt>
                <dd className="mt-2 text-base leading-relaxed text-brand-muted">
                  Former une génération de disciples matures et de leaders spirituels capables de transformer leur génération par la puissance de la Parole de Dieu.
                </dd>
              </div>
              <div className="py-6">
                <dt className="font-display text-xl font-medium text-brand-forest">Notre mission</dt>
                <dd className="mt-2 text-base leading-relaxed text-brand-muted">
                  Transmettre un enseignement biblique solide, développer le caractère de Christ et équiper chaque croyant pour accomplir son appel et son ministère.
                </dd>
              </div>
            </dl>
            <figure className="mt-8">
              <blockquote className="font-display text-xl font-medium leading-snug text-brand-forest">
                « Afin que l&apos;homme de Dieu soit accompli et propre à toute bonne œuvre. »
              </blockquote>
              <figcaption className="mt-2 text-base text-brand-muted">2 Timothée 3:17, le verset qui résume l&apos;objectif de l&apos;Académie</figcaption>
            </figure>
          </div>
          <SitePhoto photo={PHOTOS.cahier} sizes="(min-width: 1024px) 45vw, 100vw" className="aspect-[4/5] lg:col-span-5 lg:col-start-8" />
        </div>
      </section>

      {/* ── Valeurs ── */}
      <section aria-labelledby="valeurs-title" className="bg-brand-mint py-20 sm:py-24 dark:bg-[#0f1f16]">
        <div className="container-page">
          <h2 id="valeurs-title" className="section-title">Nos valeurs chrétiennes</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {valeurs.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex gap-5 p-8">
                <span className="icon-tile shrink-0"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <div>
                  <h3 className="font-display text-xl font-medium text-brand-forest">{title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-brand-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Objectifs ── */}
      <section aria-labelledby="objectifs-title" className="py-20 sm:py-24">
        <div className="container-page">
          <h2 id="objectifs-title" className="section-title">Huit objectifs de formation</h2>
          <p className="section-lead">Ils orientent chacun de nos parcours.</p>
          <ul className="mt-12 grid gap-x-6 border-t border-brand-forest/10 sm:grid-cols-2 dark:border-white/10">
            {objectifs.map((obj) => (
              <li key={obj} className="flex gap-3 border-b border-brand-forest/10 py-5 text-base leading-relaxed text-brand-ink dark:border-white/10">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-emerald" aria-hidden="true" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Approche pédagogique ── */}
      <section aria-labelledby="approche-title" className="bg-brand-mint py-20 sm:py-24 dark:bg-[#0f1f16]">
        <div className="container-page">
          <h2 id="approche-title" className="section-title">Trois façons de se former</h2>
          <p className="section-lead">
            Chaque contenu se suit à votre rythme, sans prérequis : que vous soyez nouveau croyant ou serviteur confirmé,
            l&apos;Académie vous accueille là où vous en êtes.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {approche.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card p-8">
                <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <h3 className="mt-6 font-display text-xl font-medium text-brand-forest">{label}</h3>
                <p className="mt-2 text-base leading-relaxed text-brand-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
