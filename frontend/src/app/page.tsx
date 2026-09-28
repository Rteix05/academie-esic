import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentCard } from '@/components/catalog/ContentCard';
import { SERVER_API_URL } from '@/lib/api';
import { collection, formationToItem, masterclassToItem, type CatalogItem, type FormationDto, type MasterclassDto } from '@/lib/catalog';
import { ArrowRight, BookOpen, Heart, Flame, Quote, Feather, Award, GraduationCap, Users, ShieldCheck, Sparkles, CalendarDays } from 'lucide-react';

// TODO(API) : données de démonstration — remplacer par des appels API réels
const actualitesDemo = [
  { date: "Septembre 2026", titre: "Ouverture des inscriptions pour la nouvelle session", resume: "Les inscriptions pour l'Institut Biblique Théologique et l'École du Ministère sont désormais ouvertes." },
  { date: "Août 2026", titre: "Nouvelle formation en Leadership chrétien", resume: "Un nouveau programme dédié à la formation de leaders spirituels compétents fait son entrée à l'Académie." },
];

const atouts = [
  { icon: GraduationCap, titre: "Enseignants qualifiés" },
  { icon: Users,         titre: "Accompagnement personnalisé" },
  { icon: ShieldCheck,   titre: "Cadre bienveillant" },
];

const valeurs = [
  { icon: BookOpen, titre: "Fidélité à la Parole", desc: "La Bible demeure notre référence absolue pour l'enseignement et la vie chrétienne.", tone: 'bg-brand-sage text-brand-forest' },
  { icon: Feather,  titre: "Transformation",       desc: "Le savoir n'a de valeur que lorsqu'il produit une vie semblable à celle de Christ.", tone: 'bg-amber-100 text-amber-700' },
  { icon: Award,    titre: "Excellence",           desc: "Nous servons Dieu avec rigueur, ordre et professionnalisme.", tone: 'bg-brand-forest text-white' },
  { icon: Flame,    titre: "Service & Impact",     desc: "Chaque étudiant est formé pour édifier l'Église et influencer la société.", tone: 'bg-emerald-100 text-brand-emerald' },
];

// Parcours affichés si le catalogue est indisponible (API injoignable, catalogue vide)
const parcoursRepli = [
  { id: "1", icon: BookOpen, titre: "Formation Biblique",        desc: "Plongez dans les Écritures pour en comprendre le contexte historique, spirituel et prophétique." },
  { id: "2", icon: Heart,    titre: "Famille & Vie Chrétienne", desc: "Gérer ses relations, son foyer et son éthique selon le cœur de Dieu." },
  { id: "3", icon: Flame,    titre: "Discipulat & Engagement",  desc: "Répondre à son appel, fortifier ses dons et servir sa communauté avec zèle." },
  { id: "4", icon: Award,    titre: "Leadership Chrétien",      desc: "Former des leaders spirituels compétents, intègres et servants." },
];

export const metadata: Metadata = { alternates: { canonical: '/' } };

// Catalogue public mis en cache 5 minutes (page servie instantanément, données fraîches)
async function getCatalog<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, { next: { revalidate: 300 }, headers: { Accept: 'application/ld+json' } });
    return res.ok ? collection<T>(await res.json()) : [];
  } catch {
    return [];
  }
}

/** Éléments mis en avant : disponibles, ceux qui ont un visuel d'abord, les plus récents ensuite */
function highlights(items: CatalogItem[], count: number): CatalogItem[] {
  return items
    .filter((i) => i.available)
    .sort((a, b) => Number(!!b.image) - Number(!!a.image) || b.id - a.id)
    .slice(0, count);
}

export default async function HomePage() {
  const [formationDtos, masterclassDtos] = await Promise.all([
    getCatalog<FormationDto>('/api/formations'),
    getCatalog<MasterclassDto>('/api/masterclasses'),
  ]);
  const formationsUne = highlights(formationDtos.map(formationToItem), 4);
  const masterclassesUne = highlights(masterclassDtos.map(masterclassToItem), 3);

  return (
    <div className="overflow-x-hidden text-brand-ink">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="container-page pt-4">
        <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 pb-40 pt-16 sm:px-12 lg:px-16 lg:pb-44 lg:pt-20 dark:bg-[#10231a]">
          {/* Formes décoratives */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-10 right-1/3 h-24 w-24 rounded-full border-[14px] border-brand-sage/70 dark:border-emerald-400/10" />

          <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Texte */}
            <div className="text-center lg:text-left">
              <span className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                École du Savoir et de l&apos;Intelligence Chrétienne
              </span>

              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.15] text-brand-forest sm:text-5xl lg:text-[length:calc(3.4rem*var(--text-scale,1))]">
                Former des disciples accomplis, prêts à{' '}
                <span className="relative text-brand-emerald sm:whitespace-nowrap">
                  servir avec excellence
                  <svg aria-hidden="true" viewBox="0 0 300 12" className="absolute -bottom-2 left-0 hidden h-3 w-full text-brand-emerald/40 sm:block" preserveAspectRatio="none">
                    <path d="M2 9c60-6 180-8 296-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>.
              </h1>

              <p className="mx-auto mt-9 max-w-xl text-base leading-relaxed text-brand-muted lg:mx-0 sm:text-lg">
                L&apos;Académie ESIC est un centre de formation chrétienne dédié à l&apos;édification des disciples et à la préparation des serviteurs de Dieu, enracinés dans les Écritures et équipés pour impacter l&apos;Église et la société.
              </p>

              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/register" className="btn-primary">
                  S&apos;inscrire
                  <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </Link>
                <Link href="/formations" className="btn-ghost group">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-emerald shadow-card transition group-hover:scale-105 dark:bg-white/10">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Découvrir nos formations
                </Link>
              </div>
            </div>

            {/* Visuel */}
            <div className="relative mx-auto hidden h-[420px] w-full max-w-md lg:block">
              <div aria-hidden="true" className="absolute inset-x-6 bottom-0 top-8 rounded-full bg-brand-sage dark:bg-emerald-400/10" />
              <div aria-hidden="true" className="absolute inset-x-16 bottom-8 top-20 rounded-full bg-white/70 dark:bg-white/5" />

              {/* Pastille centrale */}
              <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-forest shadow-float">
                <BookOpen className="h-16 w-16 text-white" aria-hidden="true" />
              </div>

              {/* Verset */}
              <figure className="absolute -right-2 top-4 w-60 animate-float rounded-3xl bg-white p-5 shadow-float dark:bg-[#18291e]">
                <Quote className="h-5 w-5 text-brand-emerald" aria-hidden="true" />
                <blockquote className="mt-3 text-sm leading-relaxed text-brand-ink">
                  « Afin que l&apos;homme de Dieu soit accompli et propre à toute bonne œuvre. »
                </blockquote>
                <figcaption className="mt-3 font-display text-xs font-semibold text-brand-emerald">2 Timothée 3:17</figcaption>
              </figure>

              {/* Étiquettes */}
              <div className="absolute bottom-16 left-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-float [animation-delay:0.5s] animate-float dark:bg-[#18291e]">
                <span className="icon-tile h-10 w-10 rounded-xl"><Heart className="h-4 w-4" aria-hidden="true" /></span>
                <span>
                  <span className="block font-display text-sm font-semibold text-brand-forest">Vie de disciple</span>
                  <span className="block text-xs text-brand-muted">Un caractère transformé</span>
                </span>
              </div>
              <div className="absolute bottom-0 right-6 flex items-center gap-3 rounded-2xl bg-brand-forest px-4 py-3 text-white shadow-float [animation-delay:1s] animate-float">
                <GraduationCap className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                <span className="font-display text-sm font-semibold">Études bibliques</span>
              </div>
            </div>
          </div>
        </div>

        {/* Atouts : carte flottante à cheval sur le hero */}
        <div className="relative z-10 mx-auto -mt-24 max-w-4xl px-2">
          <ul className="card grid grid-cols-1 divide-y divide-brand-forest/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10">
            {atouts.map(({ icon: Icon, titre }) => (
              <li key={titre} className="flex flex-col items-center gap-4 px-6 py-8 text-center">
                <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <span className="font-display text-sm font-semibold text-brand-forest">{titre}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 2. VALEURS ──────────────────────────────────────────────────────── */}
      <section className="container-page py-24 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Nos valeurs</span>
          <h2 className="section-title mt-4">Pourquoi nous rejoindre ?</h2>
          <p className="section-lead">Quatre convictions guident chacune de nos formations et chacun de nos accompagnements.</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valeurs.map(({ icon: Icon, titre, desc, tone }) => (
            <div key={titre} className="group text-center">
              <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
                <div aria-hidden="true" className="absolute inset-0 rounded-full bg-brand-mint transition-transform duration-500 group-hover:scale-105 dark:bg-white/5" />
                <span className={`relative flex h-20 w-20 items-center justify-center rounded-3xl shadow-card transition-transform duration-500 group-hover:-rotate-6 ${tone}`}>
                  <Icon className="h-9 w-9" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-brand-forest">{titre}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-brand-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. FORMATIONS À LA UNE ──────────────────────────────────────────── */}
      <section className="bg-brand-mint py-24 dark:bg-[#0f1f16]">
        <div className="container-page">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
            <div className="max-w-xl">
              <span className="eyebrow bg-white">Formations à la une</span>
              <h2 className="section-title mt-4">Explorez nos parcours d&apos;édification</h2>
            </div>
            <Link href="/formations" className="btn-secondary shrink-0">
              Voir toutes les formations <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {formationsUne.length > 0 ? (
            <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {formationsUne.map((item) => <ContentCard key={item.id} item={item} fluid />)}
            </div>
          ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {parcoursRepli.map(({ id, icon: Icon, titre, desc }) => (
              <Link href="/formations" key={id} className="card-hover group flex flex-col p-7">
                <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <h3 className="mt-6 font-display text-lg font-semibold text-brand-forest">{titre}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-muted">{desc}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-emerald">
                  En savoir plus
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* ── 3 bis. MASTERCLASS ──────────────────────────────────────────────── */}
      {masterclassesUne.length > 0 && (
        <section className="py-24">
          <div className="container-page">
            <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
              <div className="max-w-xl">
                <span className="eyebrow">Masterclass</span>
                <h2 className="section-title mt-4">Approfondissez avec nos intervenants</h2>
                <p className="mt-4 text-brand-muted">Des enseignements premium en vidéo et en PDF, accessibles à vie après achat.</p>
              </div>
              <Link href="/masterclass" className="btn-secondary shrink-0">
                Voir toutes les masterclass <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {masterclassesUne.map((item) => <ContentCard key={item.id} item={item} fluid />)}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. VERSET ───────────────────────────────────────────────────────── */}
      <section className="container-page py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-5xl bg-brand-forest p-10 text-white shadow-float sm:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-emerald/20" />
            <Quote className="relative h-10 w-10 text-emerald-300" aria-hidden="true" />
            <p className="relative mt-6 font-display text-2xl font-medium leading-snug sm:text-3xl">
              « Afin que l&apos;homme de Dieu soit accompli et propre à toute bonne œuvre. »
            </p>
            <p className="relative mt-6 font-display text-sm font-semibold text-emerald-300">2 Timothée 3:17</p>
          </div>

          <div>
            <span className="eyebrow">Notre vision</span>
            <h2 className="section-title mt-4">Une génération de disciples matures</h2>
            <p className="section-lead">
              Former une génération de disciples matures et de leaders spirituels capables de transformer leur génération par la puissance de la Parole de Dieu.
            </p>
            <ul className="mt-8 space-y-4">
              {["Des enseignements ancrés dans les Écritures", "Un accompagnement humain et spirituel", "Une formation tournée vers le service"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-brand-ink">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-sage text-brand-forest">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/histoire" className="btn-primary mt-9">
              Notre histoire
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* Témoignages : section retirée jusqu'à la réception de vrais avis (Académie pas encore lancée) */}

      {/* ── 6. ACTUALITÉS ───────────────────────────────────────────────────── */}
      <section className="container-page py-24">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
          <div>
            <span className="eyebrow">À la une</span>
            <h2 className="section-title mt-4">Actualités de l&apos;Académie</h2>
          </div>
          <Link href="/actualites" className="btn-secondary shrink-0">
            Toutes les actualités <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {actualitesDemo.map((a) => (
            <article key={a.titre} className="card-hover flex gap-6 p-8">
              <span className="icon-tile shrink-0"><CalendarDays className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <p className="font-display text-xs font-semibold text-brand-emerald">{a.date}</p>
                <h3 className="mt-2 font-display text-lg font-semibold text-brand-forest">{a.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">{a.resume}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
