import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Crown, Flame, Heart } from 'lucide-react';
import { ContentCard } from '@/components/catalog/ContentCard';
import SitePhoto from '@/components/SitePhoto';
import { serverFetch } from '@/lib/api';
import { fetchNews, formatNewsDate } from '@/lib/news';
import { collection, formationToItem, masterclassToItem, type CatalogItem, type FormationDto, type MasterclassDto } from '@/lib/catalog';
import { INSCRIPTIONS_DATE_LIMITE, PARCOURS } from '@/lib/parcours';
import { PHOTOS } from '@/lib/photos';

const CONVICTIONS = [
  { titre: 'Fidélité à la Parole', desc: "La Bible reste notre référence pour l'enseignement et la vie chrétienne." },
  { titre: 'Transformation', desc: "Le savoir n'a de valeur que s'il produit une vie semblable à celle de Christ." },
  { titre: 'Excellence', desc: 'Nous servons Dieu avec rigueur, ordre et professionnalisme.' },
  { titre: 'Service et impact', desc: "Chaque étudiant est formé pour édifier l'Église et servir la société." },
];

// Domaines affichés si le catalogue est indisponible (API injoignable, catalogue vide)
const DOMAINES_REPLI = [
  { icon: BookOpen, titre: 'Formation biblique', desc: 'Le contexte historique, spirituel et prophétique des Écritures.' },
  { icon: Heart, titre: 'Famille et vie chrétienne', desc: 'Les relations, le foyer et l’éthique selon le cœur de Dieu.' },
  { icon: Flame, titre: 'Discipulat', desc: 'Répondre à son appel, fortifier ses dons et servir sa communauté.' },
  { icon: Crown, titre: 'Leadership chrétien', desc: 'Former des responsables compétents, intègres et serviteurs.' },
];

export const metadata: Metadata = { alternates: { canonical: '/' } };

// Catalogue public mis en cache 5 minutes (page servie instantanément, données fraîches)
async function getCatalog<T>(path: string): Promise<T[]> {
  try {
    const res = await serverFetch(path, { next: { revalidate: 300 }, headers: { Accept: 'application/ld+json' } });
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

/** En-tête de section : titre et phrase d'introduction à gauche, lien vers la liste complète à droite */
function SectionHead({ id, title, lead, href, cta }: { id: string; title: string; lead?: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 id={id} className="section-title">{title}</h2>
        {lead && <p className="section-lead">{lead}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="btn-secondary w-full shrink-0 sm:w-auto sm:self-start md:self-auto">
          {cta}
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [formationDtos, masterclassDtos, actualites] = await Promise.all([
    getCatalog<FormationDto>('/api/formations'),
    getCatalog<MasterclassDto>('/api/masterclasses'),
    fetchNews(2),
  ]);
  const formationsUne = highlights(formationDtos.map(formationToItem), 4);
  const masterclassesUne = highlights(masterclassDtos.map(masterclassToItem), 3);

  return (
    <div className="text-brand-ink">
      {/* ── Premier écran : ce que propose l'Académie, la date limite, l'action principale ── */}
      <section aria-labelledby="hero-title" className="container-page grid items-start gap-10 pb-16 pt-10 sm:pt-12 lg:min-h-[calc(100svh-72px)] lg:grid-cols-12 lg:gap-6 lg:pb-16">
        <div className="lg:col-span-6 lg:pt-6">
          <p className="text-sm font-medium text-brand-emerald">
            Inscriptions ouvertes jusqu&apos;au {INSCRIPTIONS_DATE_LIMITE}
          </p>
          <h1 id="hero-title" className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-[-0.03em] text-brand-forest sm:text-5xl lg:text-6xl">
            Formation biblique, théologique et ministérielle
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-muted">
            L&apos;Académie E.S.I.C. forme les chrétiens et les responsables d&apos;Église en trois étapes : école biblique,
            parcours théologique personnalisé, puis mentorat théologique et ministériel.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary">
              Créer mon compte
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
            <Link href="/formations" className="btn-secondary">Voir les formations</Link>
          </div>
        </div>

        <SitePhoto
          photo={PHOTOS.carnet}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/3] lg:col-span-6 lg:aspect-auto lg:h-[min(640px,calc(100svh-72px-112px))]"
        />
      </section>

      {/* ── Le parcours en trois étapes ── */}
      <section aria-labelledby="parcours-title" className="border-t border-brand-forest/10 py-24 sm:py-28 dark:border-white/10">
        <div className="container-page">
          <SectionHead
            id="parcours-title"
            title="Un parcours de formation en trois étapes"
            lead="De l'école biblique au mentorat : trois étapes pour comprendre, approfondir et transmettre fidèlement les Écritures."
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {PARCOURS.map(({ slug, titre, resume, icon: Icon }, i) => (
              <li key={slug} className="card flex flex-col p-8">
                <div className="flex items-center justify-between">
                  <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                  <span className="font-display text-sm font-medium text-brand-muted">Étape {i + 1}</span>
                </div>
                <h3 className="mt-8 font-display text-xl font-medium text-brand-forest">{titre}</h3>
                <p className="mt-3 text-base leading-relaxed text-brand-muted">{resume}</p>
              </li>
            ))}
          </ol>
          <Link href="/formations" className="btn-primary mt-10 w-full sm:w-auto">
            Choisir ma formation
            <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
        </div>
      </section>

      {/* ── Formations à la une ── */}
      <section aria-labelledby="formations-title" className="bg-brand-mint py-24 sm:py-28 dark:bg-[#0f1f16]">
        <div className="container-page">
          <SectionHead
            id="formations-title"
            title="Formations à la une"
            lead="Des cours en ligne à suivre à votre rythme, classés par domaine dans le catalogue."
            href="/formations"
            cta="Voir toutes les formations"
          />
          {formationsUne.length > 0 ? (
            <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {formationsUne.map((item) => <ContentCard key={item.id} item={item} fluid />)}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {DOMAINES_REPLI.map(({ icon: Icon, titre, desc }) => (
                <Link href="/formations" key={titre} className="card-hover flex flex-col p-7">
                  <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                  <h3 className="mt-6 font-display text-lg font-medium text-brand-forest">{titre}</h3>
                  <p className="mt-3 text-base leading-relaxed text-brand-muted">{desc}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Masterclasses ── */}
      {masterclassesUne.length > 0 && (
        <section aria-labelledby="masterclass-title" className="py-24 sm:py-28">
          <div className="container-page">
            <SectionHead
              id="masterclass-title"
              title="Masterclasses avec nos intervenants"
              lead="Des enseignements en vidéo et en livret PDF, disponibles dans votre espace dès l'achat."
              href="/masterclass"
              cta="Voir les masterclasses"
            />
            <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {masterclassesUne.map((item) => <ContentCard key={item.id} item={item} fluid />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Convictions et vision ── */}
      <section aria-labelledby="convictions-title" className="border-t border-brand-forest/10 py-24 sm:py-28 dark:border-white/10">
        <div className="container-page grid items-start gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <h2 id="convictions-title" className="section-title">Quatre convictions guident l&apos;Académie</h2>
            <p className="section-lead">
              Notre vision : former une génération de disciples matures et de responsables spirituels, enracinés dans la Parole de Dieu.
            </p>
            <dl className="mt-10 divide-y divide-brand-forest/10 border-y border-brand-forest/10 dark:divide-white/10 dark:border-white/10">
              {CONVICTIONS.map(({ titre, desc }) => (
                <div key={titre} className="grid gap-1 py-5 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <dt className="font-display text-lg font-medium text-brand-forest">{titre}</dt>
                  <dd className="text-base leading-relaxed text-brand-muted">{desc}</dd>
                </div>
              ))}
            </dl>
            <Link href="/histoire" className="btn-secondary mt-10 w-full sm:w-auto">Lire notre histoire</Link>
          </div>
          <SitePhoto
            photo={PHOTOS.livres}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-[4/5] lg:col-span-5 lg:col-start-8"
          />
        </div>
      </section>

      {/* ── Actualités (saisies dans l'admin ; section masquée s'il n'y en a pas) ── */}
      {actualites.length > 0 && (
        <section aria-labelledby="actualites-title" className="bg-brand-mint py-24 sm:py-28 dark:bg-[#0f1f16]">
          <div className="container-page">
            <SectionHead id="actualites-title" title="Actualités de l'Académie" href="/actualites" cta="Lire toutes les actualités" />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {actualites.map((a) => (
                <article key={a.id} className="card p-8">
                  <p className="text-sm font-medium text-brand-emerald"><time dateTime={a.publishedAt}>{formatNewsDate(a.publishedAt)}</time></p>
                  <h3 className="mt-3 font-display text-xl font-medium text-brand-forest">{a.title}</h3>
                  <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-brand-muted">{a.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
