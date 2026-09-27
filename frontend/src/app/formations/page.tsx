'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, PlayCircle, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { collection, formationToItem, pickFeatured, rowsByCategory, type CatalogItem, type CatalogRow, type FormationDto } from '@/lib/catalog';
import { EmptyState, ErrorState, PageHeader } from '@/components/ui';
import Billboard, { BillboardSkeleton } from '@/components/catalog/Billboard';
import Carousel, { CarouselSkeleton, assignSharedIds, itemKey } from '@/components/catalog/Carousel';
import CategoryNav from '@/components/catalog/CategoryNav';

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
  }, []);

  const { featured, owned, all, sections, sharing } = useMemo(() => {
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

    // Rangée d'ouverture : tout le catalogue, hors formation déjà mise en avant dans le bandeau
    const allItems = items.filter((i) => i.id !== featuredItem?.id);

    const orderedRows = [
      { key: 'owned', items: ownedItems },
      { key: 'all', items: allItems },
      ...instituteSections.flatMap((s) => s.rows),
    ];

    return {
      featured: featuredItem,
      owned: ownedItems,
      all: allItems,
      sections: instituteSections,
      sharing: assignSharedIds(orderedRows, featuredItem ? [itemKey(featuredItem)] : []),
    };
  }, [formations, ownedIds]);

  const anchor = (key: string) => `rangee-${key.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="overflow-x-hidden pb-8">
      {loading ? (
        <BillboardSkeleton />
      ) : featured ? (
        <Billboard item={featured} eyebrow="Formation à la une" catalogLabel="Parcourir le catalogue" />
      ) : (
        <PageHeader
          eyebrow="Catalogue officiel"
          title="Nos formations"
          lead="Deux instituts, des dizaines de parcours structurés pour édifier des disciples solides et former des leaders du Royaume de Dieu."
        />
      )}

      <div id="catalogue" className="container-page scroll-mt-24 pt-6">
        {loading && (
          <div className="space-y-10 pt-4">
            <CarouselSkeleton featureFirst />
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
            <CategoryNav rows={sections.flatMap((s) => s.rows).map((r) => ({ id: anchor(r.key), title: r.title, count: r.items.length }))} />

            <div className="mt-6 space-y-10">
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

              <Carousel
                id="rangee-toutes"
                title="Toutes les formations"
                subtitle="Parcourez l'ensemble du catalogue"
                icon={<Sparkles className="h-5 w-5" />}
                items={all}
                featureFirst={all.length >= 3}
                sharedIds={sharing.get('all')}
              />

              {sections.map((section) => (
                <div key={section.key} className="space-y-8">
                  <header className="border-t border-brand-forest/5 pt-8 first:border-0 first:pt-0 dark:border-white/10">
                    <span className="eyebrow">{section.subtitle}</span>
                    <h2 className="mt-2 font-display text-2xl font-semibold text-brand-forest sm:text-3xl">{section.key}</h2>
                  </header>
                  {section.rows.map((row: CatalogRow) => (
                    <Carousel
                      key={row.key}
                      id={anchor(row.key)}
                      title={row.title}
                      items={row.items as CatalogItem[]}
                      featureFirst={row.items.length >= 3}
                      sharedIds={sharing.get(row.key)}
                    />
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
