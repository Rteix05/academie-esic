import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Award, BarChart3, Clock, FileText, GraduationCap, Settings, Target, User, Wallet } from 'lucide-react';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import DetailHero, { HeroTag } from '@/components/catalog/DetailHero';
import Carousel from '@/components/catalog/Carousel';
import FormationCta from './FormationCta';
import { SERVER_API_URL } from '@/lib/api';
import { collection, formationToItem, masterclassToItem, similarItems, type FormationDto, type MasterclassDto } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

// Rendu côté serveur : la page arrive complète, ce qui permet au visuel de la carte
// du catalogue de se transformer en hero (transition partagée).
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
  const formation = await getJson<FormationDto>(`/api/formations/${id}`);
  return formation
    ? { title: formation.title, description: formationToItem(formation).summary.slice(0, 160) }
    : { title: 'Formation introuvable' };
}

export default async function FormationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [formation, allFormations, allMasterclasses] = await Promise.all([
    getJson<FormationDto>(`/api/formations/${id}`),
    getJson<unknown>('/api/formations'),
    getJson<unknown>('/api/masterclasses'),
  ]);

  if (!formation) notFound();

  const item = formationToItem(formation);
  const catalog = collection<FormationDto>(allFormations).map(formationToItem);
  const { same, others } = similarItems(item, catalog);
  const masterclasses = collection<MasterclassDto>(allMasterclasses).map(masterclassToItem).filter((m) => m.available);
  const initials = formation.trainer?.split(' ').map((n) => n[0]).join('').slice(0, 2);

  const facts = [
    formation.duration && { icon: <Clock className="h-4 w-4" />, label: 'Durée', value: formation.duration },
    formation.level && { icon: <BarChart3 className="h-4 w-4" />, label: 'Niveau', value: formation.level },
    formation.trainer && { icon: <User className="h-4 w-4" />, label: 'Formateur', value: formation.trainer },
    { icon: <Wallet className="h-4 w-4" />, label: 'Frais', value: item.priceLabel },
  ].filter((f): f is { icon: React.ReactElement; label: string; value: string } => !!f);

  return (
    <div className="pb-8">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>

      <DetailHero
        item={item}
        backHref="/formations"
        backLabel="Catalogue des formations"
        tags={<>
          <HeroTag tone="solid">Formation</HeroTag>
          {formation.category && <HeroTag>{formation.category}</HeroTag>}
          {formation.institut && <HeroTag>{formation.institut}</HeroTag>}
        </>}
        facts={facts}
        actions={<>
          <FormationCta formationId={formation.id} price={formation.price ?? 0} available={item.available} />
          <a href="#programme" className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">Voir le programme</a>
        </>}
      />

      {/* ── Contenu détaillé ───────────────────────────────────────────────── */}
      <section id="programme" className="container-page mt-12 grid scroll-mt-28 items-start gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {formation.objectives && <ContentBlock icon={<Target className="h-5 w-5" />} title="Objectifs" html={formation.objectives} />}
          <ContentBlock icon={<FileText className="h-5 w-5" />} title="Contenu de la formation" html={formation.description || '<p>Programme détaillé à venir.</p>'} />
          {formation.modalities && <ContentBlock icon={<Settings className="h-5 w-5" />} title="Modalités" html={formation.modalities} />}
        </div>

        <aside className="card p-7 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-semibold text-brand-forest">En bref</h2>
          {formation.trainer && (
            <div className="mt-5 flex items-center gap-4 rounded-3xl bg-brand-mint p-4 dark:bg-white/5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-forest font-display text-sm font-semibold text-white" aria-hidden="true">{initials}</span>
              <div>
                <p className="font-display text-sm font-semibold text-brand-forest">{formation.trainer}</p>
                <p className="text-xs text-brand-muted">Formateur</p>
              </div>
            </div>
          )}
          <ul className="mt-5 space-y-3">
            {facts.filter((f) => f.label !== 'Formateur').map((f) => (
              <Perk key={f.label} icon={f.icon}>{f.label} : <strong className="font-semibold text-brand-forest">{f.value}</strong></Perk>
            ))}
            <Perk icon={<GraduationCap className="h-4 w-4" />}>Accès au contenu depuis votre espace</Perk>
            <Perk icon={<Award className="h-4 w-4" />}>Certificat de réussite inclus</Perk>
          </ul>
          <a href="#contenu-principal" className="btn-secondary mt-6 w-full">Retour en haut</a>
        </aside>
      </section>

      {/* ── Recommandations ────────────────────────────────────────────────── */}
      <div className="container-page mt-14 space-y-10">
        <Carousel
          title={formation.category ? `Dans la catégorie « ${formation.category} »` : 'Formations similaires'}
          subtitle="Poursuivez sur la même thématique"
          items={same}
          action={{ href: '/formations', label: 'Tout le catalogue' }}
          sharedIds={new Set(same.map((i) => `${i.kind}-${i.id}`))}
        />
        <Carousel
          title="Vous pourriez aussi aimer"
          items={others}
          featureFirst={others.length >= 3}
          sharedIds={new Set(others.map((i) => `${i.kind}-${i.id}`))}
        />
        <Carousel
          title="Découvrez aussi nos masterclass"
          subtitle="Des enseignements intensifs pour aller plus loin"
          items={masterclasses}
          action={{ href: '/masterclass', label: 'Toutes les masterclass' }}
          sharedIds={new Set(masterclasses.map((i) => `${i.kind}-${i.id}`))}
        />
      </div>
    </div>
  );
}

function ContentBlock({ icon, title, html }: { icon: React.ReactNode; title: string; html: string }) {
  return (
    <section className="card p-7 sm:p-9">
      <h2 className="flex items-center gap-3 font-display text-xl font-semibold text-brand-forest">
        <span className="icon-tile h-10 w-10 rounded-xl" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <div className="rich-text mt-5" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}

function Perk({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm text-brand-muted">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-mint text-brand-emerald dark:bg-white/5" aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </li>
  );
}
