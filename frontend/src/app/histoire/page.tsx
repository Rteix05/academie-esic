import type { Metadata } from 'next';
import { BookOpen, Eye, Compass, Quote, Target, CheckCircle2, GraduationCap, Video, CalendarDays, Sparkles, Award, Flame } from 'lucide-react';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez la présentation, la vision, la mission et les valeurs chrétiennes de l\'Académie E.S.I.C. — École du Savoir et de l\'Intelligence Chrétienne.',
};

const valeurs = [
  { icon: BookOpen, tone: 'bg-brand-sage text-brand-forest', title: 'Fidélité à la Parole de Dieu', desc: 'La Bible demeure notre référence absolue pour l\'enseignement et la vie chrétienne.' },
  { icon: Sparkles, tone: 'bg-amber-100 text-amber-700',     title: 'Transformation du caractère', desc: 'Le savoir n\'a de valeur que lorsqu\'il produit une vie semblable à celle de Christ.' },
  { icon: Award,    tone: 'bg-brand-forest text-white',      title: 'Excellence et discipline',    desc: 'Nous servons Dieu avec rigueur, ordre et professionnalisme.' },
  { icon: Flame,    tone: 'bg-emerald-100 text-brand-emerald', title: 'Service et impact',         desc: 'Chaque étudiant est formé pour édifier l\'Église et influencer positivement la société.' },
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
    <div className="overflow-x-hidden">
      <PageHeader
        eyebrow="École du Savoir et de l'Intelligence Chrétienne"
        title="À propos de l'Académie"
        lead="Née d'une conviction simple : la foi grandit quand elle est nourrie, questionnée et mise en pratique."
      />

      {/* ── PRÉSENTATION ─────────────────────────────────────────────────── */}
      <section className="container-page py-20 text-center">
        <span className="eyebrow">Présentation</span>
        <p className="mx-auto mt-5 max-w-3xl font-display text-2xl font-medium leading-relaxed text-brand-forest sm:text-3xl">
          Un centre de formation chrétienne dédié à l&apos;édification des disciples et à la préparation des serviteurs de Dieu.
        </p>
        <p className="section-lead mx-auto max-w-3xl">
          Nous formons des hommes et des femmes profondément enracinés dans les Écritures, transformés par le Saint-Esprit et équipés pour impacter l&apos;Église et la société avec sagesse, excellence et intégrité.
        </p>
      </section>

      {/* ── VISION & MISSION ─────────────────────────────────────────────── */}
      <section className="container-page grid gap-6 md:grid-cols-2">
        {[
          { icon: Eye,     title: 'Notre vision',  text: 'Former une génération de disciples matures et de leaders spirituels capables de transformer leur génération par la puissance de la Parole de Dieu.' },
          { icon: Compass, title: 'Notre mission', text: 'Transmettre un enseignement biblique solide, développer le caractère de Christ et équiper chaque croyant pour accomplir efficacement son appel et son ministère.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="card-hover p-10">
            <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <h2 className="mt-6 font-display text-2xl font-semibold text-brand-forest">{title}</h2>
            <p className="mt-3 leading-relaxed text-brand-muted">{text}</p>
          </div>
        ))}
      </section>

      {/* ── VERSET FONDATEUR ─────────────────────────────────────────────── */}
      <section className="container-page py-20">
        <figure className="relative overflow-hidden rounded-5xl bg-brand-forest px-8 py-16 text-center text-white shadow-float md:px-20">
          <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-brand-emerald/20" />
          <Quote className="relative mx-auto h-9 w-9 text-emerald-300" aria-hidden="true" />
          <blockquote className="relative mx-auto mt-6 max-w-2xl font-display text-2xl font-medium leading-snug sm:text-3xl">
            « Afin que l&apos;homme de Dieu soit accompli et propre à toute bonne œuvre. »
          </blockquote>
          <figcaption className="relative mt-5 font-display text-sm font-semibold text-emerald-300">2 Timothée 3:17</figcaption>
          <p className="relative mx-auto mt-5 max-w-xl text-sm text-emerald-100/70">
            Ce verset résume l&apos;objectif de l&apos;Académie : former des croyants accomplis, compétents et prêts à servir.
          </p>
        </figure>
      </section>

      {/* ── VALEURS ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-mint py-20 dark:bg-[#0f1f16]">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow bg-white dark:bg-white/5">Ce qui nous porte</span>
            <h2 className="section-title mt-4">Nos valeurs chrétiennes</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {valeurs.map(({ icon: Icon, tone, title, desc }) => (
              <div key={title} className="card-hover flex gap-5 p-8">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-brand-forest">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-brand-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OBJECTIFS ────────────────────────────────────────────────────── */}
      <section className="container-page py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="icon-tile"><Target className="h-6 w-6" aria-hidden="true" /></span>
            <span className="eyebrow mt-6">Ce que nous visons</span>
            <h2 className="section-title mt-4">Nos objectifs</h2>
            <p className="section-lead">Huit engagements qui orientent chacun de nos parcours.</p>
          </div>
          <ul className="card grid gap-x-10 gap-y-5 p-8 sm:grid-cols-2 sm:p-10">
            {objectifs.map((obj) => (
              <li key={obj} className="flex gap-3 text-sm leading-relaxed text-brand-muted">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-emerald" aria-hidden="true" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── APPROCHE PÉDAGOGIQUE ─────────────────────────────────────────── */}
      <section className="bg-brand-mint py-20 dark:bg-[#0f1f16]">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow bg-white dark:bg-white/5">Comment nous formons</span>
            <h2 className="section-title mt-4">Notre approche pédagogique</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {approche.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card-hover p-8 text-center">
                <span className="icon-tile mx-auto"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <h3 className="mt-5 font-display text-lg font-semibold text-brand-forest">{label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-brand-muted">
            Chaque contenu est conçu pour être accessible à votre rythme, sans prérequis particuliers. Que vous soyez nouveau croyant ou serviteur confirmé, l&apos;Académie vous accueille là où vous en êtes.
          </p>
        </div>
      </section>
    </div>
  );
}
