'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, GraduationCap, Video, Package, User, Receipt, Calendar, MapPin } from 'lucide-react';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import { Spinner } from '@/components/ui';
import { apiFetch, fetchMe } from '@/lib/api';

interface Formation {
  id: number;
  title: string;
  category: string;
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
  productType: 'formation' | 'masterclass' | 'event';
  productId: number;
  label: string;
  option: string | null;
  amount: number;
  currency: string;
  purchasedAt: string; // ISO 8601
  reference: string | null;
}

const PRODUCT_LABELS: Record<PaymentRecord['productType'], string> = {
  formation: 'Formation',
  masterclass: 'Masterclass',
  event: 'Événement',
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
}

interface EventRegistration {
  id: number;
  title: string;
  location: string;
  startDate: string;
  price: number;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [mesFormations, setMesFormations] = useState<Formation[]>([]);
  const [mesMasterclasses, setMesMasterclasses] = useState<MasterclassPurchase[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [mesEvenements, setMesEvenements] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  // Prénom pour le message d'accueil (facultatif)
  useEffect(() => {
    fetchMe().then((me) => setFirstName(me?.firstName ?? null));
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
      load('/api/mes-evenements'),
    ])
      .then(([formations, masterclasses, history, evenements]) => {
        setMesFormations(Array.isArray(formations) ? formations : formations['hydra:member'] || []);
        setMesMasterclasses(Array.isArray(masterclasses) ? masterclasses : []);
        setPaymentHistory(Array.isArray(history) ? history : []);
        setMesEvenements(Array.isArray(evenements) ? evenements : []);
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

  const stats = [
    { icon: GraduationCap, value: mesFormations.length, label: 'Formations' },
    { icon: Video, value: mesMasterclasses.length, label: 'Masterclasses' },
    { icon: Calendar, value: mesEvenements.length, label: 'Événements' },
  ];

  return (
    <div className="pb-8">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>

      {/* Bandeau d'accueil */}
      <section className="container-page pt-4">
        <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-10 sm:px-12 sm:py-12 dark:bg-[#10231a]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow bg-white dark:bg-white/5">Mon espace</span>
              <h1 className="mt-4 font-display text-3xl font-semibold text-brand-forest sm:text-4xl">
                Bonjour{firstName ? ` ${firstName}` : ''} 👋
              </h1>
              <p className="mt-2 text-brand-muted">Reprenez votre apprentissage là où vous l&apos;avez laissé.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-3xl bg-white px-5 py-4 shadow-card dark:bg-white/5">
                  <span className="icon-tile h-11 w-11 rounded-2xl"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <span>
                    <span className="block font-display text-2xl font-semibold leading-none text-brand-forest">{value}</span>
                    <span className="text-xs text-brand-muted">{label}</span>
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

      <section className="container-page mt-10">
        {error && <p role="alert" className="mb-8 rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</p>}

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Formations */}
            <Panel icon={<GraduationCap className="h-5 w-5" />} title="Mes cursus actifs">
              {mesFormations.length === 0 ? (
                <EmptyPanel text="Vous n'avez pas encore de formation en cours." href="/formations" cta="Parcourir le catalogue" />
              ) : (
                <ul className="space-y-3">
                  {mesFormations.map((formation) => (
                    <li key={formation.id} className="group flex items-center justify-between gap-4 rounded-3xl bg-brand-cream p-4 transition hover:bg-brand-mint dark:bg-white/5">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="icon-tile h-12 w-12 shrink-0 bg-white dark:bg-white/10"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
                        <div className="min-w-0">
                          {formation.category && <span className="text-xs text-brand-muted">{formation.category}</span>}
                          <h3 className="truncate font-display font-semibold text-brand-forest">{formation.title}</h3>
                        </div>
                      </div>
                      <Link href={`/dashboard/cours/${formation.id}`} className="btn-primary shrink-0 py-2 pl-4">
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
                <EmptyPanel text="Vous n'avez pas encore acheté de masterclass." href="/masterclass" cta="Voir le catalogue" />
              ) : (
                <ul className="space-y-3">
                  {mesMasterclasses.map((mc) => {
                    const hasVideo = mc.options.includes('video') || mc.options.includes('pack');
                    const hasPdf   = mc.options.includes('pdf')   || mc.options.includes('pack');
                    return (
                      <li key={mc.id} className="rounded-3xl bg-brand-cream p-5 dark:bg-white/5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-display font-semibold text-brand-forest">{mc.title}</h3>
                          {mc.options.includes('pack') && (
                            <span className="chip bg-brand-sage"><Package className="h-3.5 w-3.5" aria-hidden="true" /> Pack complet</span>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {hasVideo && mc.video && (
                            // Lecture sur le site, dans le lecteur de la fiche masterclass
                            <Link href={`/masterclass/${mc.id}#acces`} className="btn-primary-plain py-2 text-xs">
                              <Video className="h-4 w-4" aria-hidden="true" /> Regarder la vidéo
                            </Link>
                          )}
                          {hasPdf && (
                            <Link href={`/masterclass/${mc.id}`} className="btn-secondary py-2 text-xs">
                              <FileText className="h-4 w-4" aria-hidden="true" /> Accéder au PDF
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

          {/* Événements */}
          <Panel icon={<Calendar className="h-5 w-5" />} title="Mes événements">
            {mesEvenements.length === 0 ? (
              <EmptyPanel text="Vous n'êtes inscrit à aucun événement." href="/evenements" cta="Voir l'agenda" />
            ) : (
              <ul className="space-y-3">
                {mesEvenements.map((ev) => (
                  <li key={ev.id}>
                    <Link href={`/evenements/${ev.id}`} className="group flex items-center gap-4 rounded-3xl bg-brand-cream p-4 transition hover:bg-brand-mint dark:bg-white/5">
                      <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white text-center shadow-card dark:bg-white/10">
                        <span className="font-display text-lg font-semibold leading-none text-brand-forest">
                          {new Date(ev.startDate).toLocaleDateString('fr-FR', { day: '2-digit' })}
                        </span>
                        <span className="mt-0.5 text-[10px] font-medium uppercase text-brand-emerald">
                          {new Date(ev.startDate).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
                        </span>
                      </span>
                      <span className="min-w-0">
                        <span className={`chip mb-1 ${ev.status === 'paid' ? 'bg-amber-100 text-amber-800' : 'bg-brand-sage'}`}>
                          {ev.status === 'paid' ? 'Payant' : ev.status === 'pending' ? 'Paiement en attente' : 'Gratuit'}
                        </span>
                        <span className="block truncate font-display text-sm font-semibold text-brand-forest group-hover:text-brand-emerald">{ev.title}</span>
                        <span className="flex items-center gap-1 text-xs text-brand-muted"><MapPin className="h-3 w-3" aria-hidden="true" /> {ev.location}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Historique des paiements */}
        <div className="mt-6">
          <Panel icon={<Receipt className="h-5 w-5" />} title="Historique des paiements">
            {paymentHistory.length === 0 ? (
              <p className="rounded-3xl bg-brand-cream p-8 text-center text-sm text-brand-muted dark:bg-white/5">Aucun achat enregistré pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-brand-muted">
                      <th className="px-4 pb-3 font-medium">Achat</th>
                      <th className="px-4 pb-3 font-medium">Type</th>
                      <th className="px-4 pb-3 font-medium">Montant payé</th>
                      <th className="px-4 pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((p) => (
                      <tr key={p.id} className="border-t border-brand-forest/5 dark:border-white/10">
                        <td className="px-4 py-4 font-medium text-brand-forest">
                          {p.label}
                          {p.reference && <span className="block font-mono text-[11px] text-brand-muted">Réf. {p.reference}</span>}
                        </td>
                        <td className="px-4 py-4"><span className="chip">{PRODUCT_LABELS[p.productType]}</span></td>
                        <td className="px-4 py-4 font-display font-semibold text-brand-forest">{formatAmount(p.amount, p.currency)}</td>
                        <td className="px-4 py-4 text-brand-muted">{new Date(p.purchasedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
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
      <h2 className="mb-5 flex items-center gap-3 font-display text-lg font-semibold text-brand-forest">
        <span className="icon-tile h-10 w-10 rounded-xl" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyPanel({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-brand-cream px-6 py-10 text-center dark:bg-white/5">
      <p className="text-sm text-brand-muted">{text}</p>
      <Link href={href} className="btn-primary mt-5">
        {cta}
        <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
      </Link>
    </div>
  );
}
