'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import MasterclassesList from '@/components/MasterclassesList';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import { apiFetch } from '@/lib/api';
import { collection, masterclassToItem, pickFeatured, type MasterclassDto } from '@/lib/catalog';
import { EmptyState, ErrorState, PageHeader } from '@/components/ui';
import Billboard, { BillboardSkeleton } from '@/components/catalog/Billboard';
import { CarouselSkeleton, itemKey } from '@/components/catalog/Carousel';
import { ShieldCheck, Clock, BookOpen } from 'lucide-react';

export default function MasterclassPage() {
  const [masterclasses, setMasterclasses] = useState<MasterclassDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Catalogue public, format JSON-LD d'API Platform
      const res = await apiFetch('/api/masterclasses', {
        headers: { 'Accept': 'application/ld+json, application/json' },
      });
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      setMasterclasses(collection<MasterclassDto>(await res.json()));
      setError(null);
    } catch (err) {
      console.error('Impossible de charger les masterclasses', err);
      setError(err instanceof Error ? err.message : 'Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const featured = useMemo(() => pickFeatured(masterclasses.map(masterclassToItem)), [masterclasses]);

  return (
    <div className="overflow-x-hidden pb-8">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>

      {loading ? (
        <BillboardSkeleton />
      ) : featured ? (
        <Billboard item={featured} eyebrow="Masterclass à la une" catalogLabel="Parcourir les masterclass" />
      ) : (
        <PageHeader
          eyebrow="Enseignements exclusifs"
          title="Les Masterclass"
          lead="Des sessions intensives animées par des enseignants engagés. Allez plus loin dans l'étude de la Parole et découvrez des clés pratiques pour fortifier votre marche chrétienne."
        />
      )}

      {/* Réassurance */}
      <section className="container-page mt-6">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, titre: 'Paiement sécurisé', desc: 'Transactions protégées par Stripe' },
            { icon: Clock,       titre: 'Accès à vie',        desc: 'Apprenez à votre rythme' },
            { icon: BookOpen,    titre: "Supports d'étude",   desc: 'Vidéos et livrets PDF' },
          ].map(({ icon: Icon, titre, desc }) => (
            <li key={titre} className="card flex items-center gap-4 px-5 py-4">
              <span className="icon-tile h-11 w-11 shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span>
                <span className="block font-display text-sm font-semibold text-brand-forest">{titre}</span>
                <span className="block text-xs text-brand-muted">{desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div id="catalogue" className="container-page scroll-mt-24 pt-6">
        {loading ? (
          <div className="space-y-10 pt-4">
            <CarouselSkeleton featureFirst />
            <CarouselSkeleton />
          </div>
        ) : error ? (
          <ErrorState message={`Impossible de charger le catalogue : ${error}`} onRetry={loadData} />
        ) : masterclasses.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-6 w-6" />} title="Aucune masterclass pour le moment">
            Repassez très bientôt : de nouveaux enseignements arrivent.
          </EmptyState>
        ) : (
          <MasterclassesList masterclasses={masterclasses} featuredKey={featured ? itemKey(featured) : null} />
        )}
      </div>
    </div>
  );
}
