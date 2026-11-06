'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, PlayCircle } from 'lucide-react';
import { PARCOURS } from '@/lib/parcours';
import { apiFetch } from '@/lib/api';
import { collection, formationToItem, pickFeatured, rowsByCategory, type CatalogItem, type CatalogRow, type FormationDto } from '@/lib/catalog';
import { EmptyState, ErrorState, PageHeader } from '@/components/ui';
import Billboard, { BillboardSkeleton } from '@/components/catalog/Billboard';
import Carousel, { CarouselSkeleton, assignSharedIds, itemKey } from '@/components/catalog/Carousel';
import CategoryNav from '@/components/catalog/CategoryNav';
import InstitutPackCard from '@/components/InstitutPackCard';
import { fetchInstitutPackOffers, fetchMyInstitutPacks, type InstitutPackOffer } from '@/lib/institutPacks';

// Ordre éditorial des sous-catégories (les autres suivent par ordre alphabétique)
const CATEGORY_ORDER = [
  'Formation biblique', 'Discipulat', 'Développement personnel', 'Famille et vie chrétienne',
  'Leadership chrétien', 'Formation poussée', 'Ministère', 'Autres programmes',
];

const INSTITUTES = [
  { key: 'Institut Biblique Théologique',        subtitle: 'Institut 1' },
  { key: 'École du Ministère et du Leadership', subtitle: 'Institut 2' },
];

interface InstituteSection {
  key: string;
  subtitle: string;
  rows: CatalogRow[];
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<FormationDto[]>([]);
  const [ownedIds, setOwnedIds]     = useState<number[]>([]);
  const [offers, setOffers]         = useState<InstitutPackOffer[]>([]);
  const [ownedPacks, setOwnedPacks] = useState<string[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch('/api/formations', { headers: { Accept: 'application/ld+json' } });
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      setFormations(collection<FormationDto>(await res.json()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Formations de l'utilisateur connecté (401 si non connecté : on ignore)
    apiFetch('/api/mes-formations')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: number }[]) => setOwnedIds(Array.isArray(list) ? list.map((f) => f.id) : []))
      .catch(() => {});
    // Accès complets aux instituts (offres publiques, accès achetés si connecté)
    fetchInstitutPackOffers().then(setOffers);
    fetchMyInstitutPacks().then((packs) => setOwnedPacks(packs.map((p) => p.pack)));
  }, []);

  const { featured, owned, sections, sharing } = useMemo(() => {
    // Seules les formations publiées sont proposées dans le catalogue
    const byId = new Map<number, FormationDto>(formations.map((f) => [f.id, f]));
    const items = formations.map(formationToItem).filter((i) => i.available);
    const featuredItem = pickFeatured(items);

    const ownedItems = ownedIds
      .map((id) => byId.get(id))
      .filter((f): f is FormationDto => !!f)
      .map(formationToItem);

    const instituteSections: InstituteSection[] = INSTITUTES.map((inst) => ({
      ...inst,
      rows: rowsByCategory(
        items.filter((i) => {
          const institut = byId.get(i.id)?.institut;
          return institut === inst.key || (!institut && inst.key === INSTITUTES[0].key);
        }),
        CATEGORY_ORDER,
      ).map((row) => ({ ...row, key: `${inst.key}-${row.key}` })),
    })).filter((s) => s.rows.length > 0);


    // Une grille par institut : ses formations, classées dans l'ordre éditorial des sous-catégories
    const orderedRows = [
      { key: 'owned', items: ownedItems },
      ...instituteSections.map((s) => ({ key: s.key, items: s.rows.flatMap((r) => r.items as CatalogItem[]) })),
    ];

    return {
      featured: featuredItem,
      owned: ownedItems,
      sections: instituteSections,
      sharing: assignSharedIds(orderedRows, featuredItem ? [itemKey(featuredItem)] : []),
    };
  }, [formations, ownedIds]);

  const anchor = (key: string) => `rangee-${key.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="pb-20">
      {/* Titre de la page, présent avant le chargement du catalogue (le hero porte un h2) */}
      <h1 className="sr-only">Formations</h1>
      {loading ? (
        <BillboardSkeleton />
      ) : featured ? (
        <Billboard item={featured} eyebrow="Formation à la une" catalogLabel="Voir le catalogue" />
      ) : (
        <PageHeader
          eyebrow="Catalogue officiel"
          title="Nos formations"
          lead="Deux instituts, des dizaines de parcours structurés pour édifier des disciples solides et former des leaders du Royaume de Dieu."
        />
      )}

      {/* Les trois parcours de formation */}
      <section aria-labelledby="parcours-titre" className="container-page pt-14 sm:pt-20">
        <h2 id="parcours-titre" className="section-title">Un parcours en trois étapes</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {PARCOURS.map(({ slug, titre, resume, icon: Icon }, i) => (
            <li key={slug} className="card flex flex-col p-7">
              <div className="flex items-center justify-between">
                <span className="icon-tile"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <span className="font-display text-sm font-medium text-brand-emerald">Étape {i + 1}</span>
              </div>
              <h3 className="mt-6 font-display text-lg font-medium text-brand-forest">{titre}</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-brand-muted">{resume}</p>
            </li>
          ))}
        </ol>
      </section>

      <div id="catalogue" className="container-page scroll-mt-24 pt-20">
        {loading && (
          <div className="space-y-10 pt-4">
            <CarouselSkeleton />
            <CarouselSkeleton />
          </div>
        )}
        {error && <div className="py-10"><ErrorState message={error} onRetry={load} /></div>}

        {!loading && !error && sections.length === 0 && (
          <div className="py-10">
            <EmptyState icon={<BookOpen className="h-6 w-6" />} title="Aucune formation disponible pour le moment" />
          </div>
        )}

        {!loading && !error && sections.length > 0 && (
          <>
            <CategoryNav rows={sections.map((s) => ({ id: anchor(s.key), title: s.key, count: s.rows.reduce((n, r) => n + r.items.length, 0) }))} />

            <div className="mt-12 space-y-16">
              {owned.length > 0 && (
                <Carousel
                  title="Reprendre mes formations"
                  subtitle="Vos parcours en cours"
                  icon={<PlayCircle className="h-5 w-5" />}
                  items={owned}
                  sharedIds={sharing.get('owned')}
                  action={{ href: '/dashboard', label: 'Mon espace' }}
                />
              )}

              {sections.map((section) => (
                <div key={section.key} id={anchor(section.key)} className="scroll-mt-28 space-y-8">
                  <header className="border-t border-brand-forest/10 pt-12 dark:border-white/10">
                    <span className="eyebrow">{section.subtitle}</span>
                    <h2 className="section-title mt-2">{section.key}</h2>
                  </header>
                  <Carousel
                    title={`Formations de l'${section.key}`}
                    hideTitle
                    items={section.rows.flatMap((r: CatalogRow) => r.items as CatalogItem[])}
                    sharedIds={sharing.get(section.key)}
                  />
                  {offers.filter((o) => o.institut === section.key).map((offer) => (
                    <InstitutPackCard key={offer.pack} offer={offer} owned={ownedPacks.includes(offer.pack)} />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
