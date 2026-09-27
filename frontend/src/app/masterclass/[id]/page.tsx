import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, FileText, Mic2, Video, Wallet } from 'lucide-react';
import PaywallGate from '@/components/PaywallGate';
import DetailHero, { HeroTag } from '@/components/catalog/DetailHero';
import Carousel from '@/components/catalog/Carousel';
import MasterclassCta from './MasterclassCta';
import { SERVER_API_URL } from '@/lib/api';
import { collection, formationToItem, masterclassFromPrice, masterclassToItem, similarItems, type FormationDto, type MasterclassDto } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

// Rendu côté serveur : adresse interne du backend (cf. SERVER_API_URL). La page arrive
// complète, ce qui permet à la carte du catalogue de se transformer en hero.
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, { cache: 'no-store', headers: { Accept: 'application/ld+json' } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mc = await getJson<MasterclassDto>(`/api/masterclasses/${id}`);
  return mc ? { title: mc.title, description: masterclassToItem(mc).summary.slice(0, 160) } : { title: 'Masterclass introuvable' };
}

export default async function MasterclassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [mc, allMasterclasses, allFormations] = await Promise.all([
    getJson<MasterclassDto>(`/api/masterclasses/${id}`),
    getJson<unknown>('/api/masterclasses'),
    getJson<unknown>('/api/formations'),
  ]);

  if (!mc) notFound();

  const item = masterclassToItem(mc);
  const fromPrice = masterclassFromPrice(mc);
  const others = collection<MasterclassDto>(allMasterclasses).map(masterclassToItem).filter((m) => m.id !== mc.id);
  const { same } = similarItems(item, others.map((m) => ({ ...m, available: true })));
  const recommendations = same.length ? same : others;
  const formations = collection<FormationDto>(allFormations).map(formationToItem).filter((f) => f.available);

  const facts = [
    { icon: <Mic2 className="h-4 w-4" />, label: 'Intervenant', value: item.author || "L'équipe E.S.I.C." },
    mc.scheduledAt && {
      icon: <CalendarDays className="h-4 w-4" />,
      label: 'Publiée le',
      value: new Date(mc.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    { icon: <Wallet className="h-4 w-4" />, label: 'Tarif', value: item.priceLabel },
  ].filter((f): f is { icon: React.ReactElement; label: string; value: string } => !!f);

  return (
    <div className="pb-8">
      <DetailHero
        item={item}
        backHref="/masterclass"
        backLabel="Catalogue des masterclass"
        tags={<>
          <HeroTag tone="solid">Masterclass</HeroTag>
          {mc.videoAvailable && <HeroTag><Video className="h-3.5 w-3.5" aria-hidden="true" /> Vidéo</HeroTag>}
          {mc.pdfAvailable && <HeroTag><FileText className="h-3.5 w-3.5" aria-hidden="true" /> Livret PDF</HeroTag>}
        </>}
        facts={facts}
        actions={<MasterclassCta masterclassId={mc.id} fromPrice={fromPrice} />}
      />

      {/* Lecteur, description et options d'achat (ancre #acces) */}
      <PaywallGate mc={mc} />

      {/* ── Recommandations ────────────────────────────────────────────────── */}
      <div className="container-page mt-14 space-y-10">
        <Carousel
          title="Vous pourriez aussi aimer"
          subtitle="D'autres enseignements de l'Académie"
          items={recommendations}
          featureFirst={recommendations.length >= 3}
          action={{ href: '/masterclass', label: 'Toutes les masterclass' }}
          sharedIds={new Set(recommendations.map((i) => `${i.kind}-${i.id}`))}
        />
        <Carousel
          title="Approfondir avec une formation"
          subtitle="Des parcours structurés pour aller plus loin"
          items={formations}
          action={{ href: '/formations', label: 'Toutes les formations' }}
          sharedIds={new Set(formations.map((i) => `${i.kind}-${i.id}`))}
        />
      </div>
    </div>
  );
}
