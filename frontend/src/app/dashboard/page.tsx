'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, Compass, FileText, GraduationCap, Video, Package, User, Receipt, Library, Download, Loader2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ContentCard } from '@/components/catalog/ContentCard';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import { Spinner } from '@/components/ui';
import { apiFetch, fetchMe, type Me } from '@/lib/api';
import { collection, formationToItem, type FormationDto } from '@/lib/catalog';
import { recommendFormations } from '@/lib/preferences';
import { formatDate, type MyInstitutPack } from '@/lib/institutPacks';

interface Formation {
  id: number;
  title: string;
  category: string;
  access?: 'achat' | 'institut';
}

interface MasterclassPurchase {
  id: number;
  title: string;
  video: string | null;
  options: string[];
}

// Paiement encaissé : montant réellement payé, figé au moment de l'achat
interface PaymentRecord {
  id: number;
  productType: 'formation' | 'masterclass' | 'event' | 'institut';
  productId: number;
  label: string;
  option: string | null;
  amount: number;
  currency: string;
  purchasedAt: string; // ISO 8601
  reference: string | null;
  hasInvoice?: boolean;
}

const PRODUCT_LABELS: Record<PaymentRecord['productType'], string> = {
  formation: 'Formation',
  masterclass: 'Masterclass',
  event: 'Événement',
  institut: 'Accès institut',
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
}

export default function DashboardPage() {
  const router = useRouter();
  const [mesFormations, setMesFormations] = useState<Formation[]>([]);
  const [mesMasterclasses, setMesMasterclasses] = useState<MasterclassPurchase[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [institutPacks, setInstitutPacks] = useState<MyInstitutPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [catalog, setCatalog] = useState<FormationDto[] | null>(null);
  const firstName = me?.firstName ?? null;

  // Prénom pour le message d'accueil, préférences pour les recommandations
  useEffect(() => {
    fetchMe().then((profile) => {
      setMe(profile);
      if (profile?.preferences?.interests.length) {
        apiFetch('/api/formations', { headers: { Accept: 'application/ld+json' } })
          .then((r) => (r.ok ? r.json() : []))
          .then((data) => setCatalog(collection<FormationDto>(data)))
          .catch(() => setCatalog([]));
      }
    });
  }, []);

  useEffect(() => {
    // Session portée par le cookie httpOnly : un 401 signifie "non connecté"
    const load = async (path: string) => {
      const r = await apiFetch(path);
      if (r.status === 401) throw new Error('unauthenticated');
      return r.ok ? r.json() : [];
    };

    Promise.all([
      load('/api/mes-formations'),
      load('/api/mes-masterclasses'),
      load('/api/payment-history'),
      load('/api/mes-instituts'),
    ])
      .then(([formations, masterclasses, history, packs]) => {
        setMesFormations(Array.isArray(formations) ? formations : formations['hydra:member'] || []);
        setMesMasterclasses(Array.isArray(masterclasses) ? masterclasses : []);
        setPaymentHistory(Array.isArray(history) ? history : []);
        setInstitutPacks(Array.isArray(packs) ? packs : []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.message === 'unauthenticated') {
          router.push('/login');
          return;
        }
        setError(err.message);
        setIsLoading(false);
      });

  }, [router]);

  if (isLoading) {
    return <Spinner label="Chargement de votre espace…" />;
  }

  const recommended = me?.preferences
    ? recommendFormations(catalog ?? [], me.preferences, mesFormations.map((f) => f.id), 3)
    : [];

  const stats = [
    { icon: GraduationCap, value: mesFormations.length, label: 'Formations' },
    { icon: Video, value: mesMasterclasses.length, label: 'Masterclasses' },
  ];

  return (
    <div className="pb-8">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>

      {/* Bandeau d'accueil */}
      <section className="border-b border-brand-forest/10 dark:border-white/10">
        <div className="container-page py-12 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">Mon espace</span>
              <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.03em] text-brand-forest sm:text-5xl">
                Bonjour{firstName ? ` ${firstName}` : ''}
              </h1>
              <p className="mt-3 text-lg text-brand-muted">Reprenez votre apprentissage là où vous l&apos;avez laissé.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="card flex items-center gap-3 px-5 py-4">
                  <span className="icon-tile h-11 w-11 rounded-lg"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span>
                    <span className="block font-display text-2xl font-medium leading-none text-brand-forest">{value}</span>
                    <span className="text-sm text-brand-muted">{label}</span>
                  </span>
                </div>
              ))}
              <Link href="/dashboard/profil" className="btn-secondary self-center">
                <User className="h-4 w-4" aria-hidden="true" /> Mon profil
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-12">
        {error && <p role="alert" className="mb-8 rounded-xl bg-red-50 px-5 py-4 text-base font-medium text-red-700">{error}</p>}

        {/* Parcours guidé : invitation tant qu'il n'a pas été fait, puis recommandations */}
        {me && !me.onboarded && (
          <div className="mb-8 flex flex-col gap-5 rounded-4xl border border-brand-emerald/20 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8 dark:bg-white/5">
            <div className="flex items-start gap-4">
              <span className="icon-tile h-12 w-12 shrink-0"><Compass className="h-6 w-6" aria-hidden="true" /></span>
              <div>
                <h2 className="font-display text-lg font-medium text-brand-forest">Trouvez les formations faites pour vous</h2>
                <p className="mt-1 text-sm text-brand-muted">Trois questions, moins d&apos;une minute : nous vous proposons une sélection adaptée à vos envies et à votre niveau.</p>
              </div>
            </div>
            <Link href="/bienvenue" className="btn-primary shrink-0 self-start sm:self-center">
              Commencer
              <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          </div>
        )}

        {me?.onboarded && (
          <div className="mb-8">
            <Panel icon={<Sparkles className="h-5 w-5" />} title="Recommandé pour vous">
              {catalog === null && me.preferences?.interests.length ? (
                <p className="flex items-center gap-2 text-sm text-brand-muted" role="status">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Recherche des formations pour vous…
                </p>
              ) : recommended.length > 0 ? (
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {recommended.map((f) => <ContentCard key={f.id} item={formationToItem(f)} fluid />)}
                </div>
              ) : (
                <p className="text-base text-brand-muted">
                  {me.preferences?.interests.length
                    ? 'Aucune nouvelle formation dans vos domaines pour le moment.'
                    : 'Indiquez les domaines qui vous intéressent pour recevoir des recommandations.'}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/bienvenue" className="btn-secondary">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Modifier mes préférences
                </Link>
                <Link href="/formations" className="btn-ghost">Voir tout le catalogue</Link>
              </div>
            </Panel>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-2">
            {/* Formations */}
            <Panel icon={<GraduationCap className="h-5 w-5" />} title="Mes cursus actifs">
              {mesFormations.length === 0 ? (
                <EmptyPanel text="Vous n'avez pas encore de formation en cours." href="/formations" cta="Voir les formations" />
              ) : (
                <ul>
                  {mesFormations.map((formation) => (
                    <li key={formation.id} className="group flex items-center justify-between gap-4 border-b border-brand-forest/10 py-4 last:border-0 dark:border-white/10">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="icon-tile h-12 w-12 shrink-0"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
                        <div className="min-w-0">
                          <span className="text-xs text-brand-muted">
                            {formation.category}
                            {formation.access === 'institut' && <>{formation.category && ' · '}Incluse dans votre accès complet</>}
                          </span>
                          <h3 className="truncate font-display font-medium text-brand-forest">{formation.title}</h3>
                        </div>
                      </div>
                      <Link href={`/dashboard/cours/${formation.id}`} className="btn-primary shrink-0 py-2 pl-4" aria-label={`Reprendre la formation ${formation.title}`}>
                        Reprendre
                        <span className="btn-icon h-7 w-7"><ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Masterclasses */}
            <Panel icon={<Video className="h-5 w-5" />} title="Mes masterclasses">
              {mesMasterclasses.length === 0 ? (
                <EmptyPanel text="Vous n'avez pas encore acheté de masterclass." href="/masterclass" cta="Voir les masterclasses" />
              ) : (
                <ul>
                  {mesMasterclasses.map((mc) => {
                    const hasVideo = mc.options.includes('video') || mc.options.includes('pack');
                    const hasPdf   = mc.options.includes('pdf')   || mc.options.includes('pack');
                    return (
                      <li key={mc.id} className="border-b border-brand-forest/10 py-5 last:border-0 dark:border-white/10">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-display font-medium text-brand-forest">{mc.title}</h3>
                          {mc.options.includes('pack') && (
                            <span className="chip bg-brand-sage"><Package className="h-3.5 w-3.5" aria-hidden="true" /> Pack complet</span>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {hasVideo && mc.video && (
                            // Lecture sur le site, dans le lecteur de la fiche masterclass
                            <Link href={`/masterclass/${mc.id}#acces`} className="btn-primary-plain py-2 text-xs">
                              <Video className="h-4 w-4" aria-hidden="true" /> Regarder la vidéo<span className="sr-only"> : {mc.title}</span>
                            </Link>
                          )}
                          {hasPdf && (
                            <Link href={`/masterclass/${mc.id}`} className="btn-secondary py-2 text-xs">
                              <FileText className="h-4 w-4" aria-hidden="true" /> Accéder au PDF<span className="sr-only"> : {mc.title}</span>
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
        </div>

        {/* Accès complets aux instituts */}
        {institutPacks.length > 0 && (
          <div className="mt-6">
            <Panel icon={<Library className="h-5 w-5" />} title="Mes accès instituts">
              <InstitutPackList packs={institutPacks} />
            </Panel>
          </div>
        )}

        {/* Historique des paiements */}
        <div className="mt-6">
          <Panel icon={<Receipt className="h-5 w-5" />} title="Historique des paiements">
            {paymentHistory.length === 0 ? (
              <p className="text-base text-brand-muted">Aucun achat enregistré pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Historique de vos paiements</caption>
                  <thead>
                    <tr className="text-left text-xs text-brand-muted">
                      <th scope="col" className="px-4 pb-3 font-medium">Achat</th>
                      <th scope="col" className="px-4 pb-3 font-medium">Type</th>
                      <th scope="col" className="px-4 pb-3 font-medium">Montant payé</th>
                      <th scope="col" className="px-4 pb-3 font-medium">Date</th>
                      <th scope="col" className="px-4 pb-3 font-medium"><span className="sr-only">Facture</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((p) => (
                      <tr key={p.id} className="border-t border-brand-forest/5 dark:border-white/10">
                        <td className="px-4 py-4 font-medium text-brand-forest">
                          {p.label}
                          {p.reference && <span className="block font-mono text-xs text-brand-muted">Réf. {p.reference}</span>}
                        </td>
                        <td className="px-4 py-4"><span className="chip">{PRODUCT_LABELS[p.productType]}</span></td>
                        <td className="px-4 py-4 font-display font-medium text-brand-forest">{formatAmount(p.amount, p.currency)}</td>
                        <td className="px-4 py-4 text-brand-muted">{new Date(p.purchasedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                        <td className="px-4 py-4 text-right">{p.hasInvoice && <InvoiceButton paymentId={p.id} label={p.label} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 sm:p-7">
      <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-medium text-brand-forest">
        <span className="icon-tile h-10 w-10 rounded-lg" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Facture PDF générée par Stripe, ouverte dans un nouvel onglet */
function InvoiceButton({ paymentId, label }: { paymentId: number; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    setError(null);
    setLoading(true);
    // Onglet ouvert pendant le clic : sinon bloqué par le navigateur après l'appel réseau
    const tab = window.open('', '_blank');
    try {
      const res = await apiFetch(`/api/payment-history/${paymentId}/invoice`);
      const data: { url?: string; message?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.message || 'Facture indisponible.');
      if (tab) { tab.opener = null; tab.location.href = data.url; } else { window.location.assign(data.url); }
    } catch (err) {
      tab?.close();
      setError(err instanceof Error ? err.message : 'Facture indisponible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={open} disabled={loading} className="btn-ghost whitespace-nowrap py-1.5 text-sm" aria-label={`Télécharger la facture : ${label}`}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
        Facture
      </button>
      {error && <span role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</span>}
    </div>
  );
}

function InstitutPackList({ packs }: { packs: MyInstitutPack[] }) {
  return (
    <ul>
      {packs.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-forest/10 py-5 last:border-0 dark:border-white/10">
          <div>
            <h3 className="font-display font-medium text-brand-forest">{p.institut}</h3>
            <p className="mt-1 text-sm text-brand-muted">Toutes les formations de l&apos;institut, à vie · acheté le {formatDate(p.purchasedAt)}</p>
          </div>
          <Link href="/formations" className="btn-secondary py-2">Voir les formations</Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyPanel({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-start">
      <p className="text-base text-brand-muted">{text}</p>
      <Link href={href} className="btn-secondary mt-5">
        {cta}
        <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
      </Link>
    </div>
  );
}
