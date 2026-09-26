'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Video, Package, ExternalLink, User, Receipt, Calendar, MapPin } from 'lucide-react';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import { apiFetch } from '@/lib/api';

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

interface PaymentRecord {
  id: number;
  masterclassTitle: string;
  masterclassId: number;
  option: string;
  amount: number;
  purchasedAt: string;
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
    return <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center font-medium text-[#0F291E]">Chargement de votre espace...</div>;
  }

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F291E] tracking-tight">
            Mon Apprentissage
          </h1>
          <Link
            href="/dashboard/profil"
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-xs font-bold text-[#0F291E] rounded-full hover:bg-gray-50 transition shadow-sm"
          >
            <User className="w-4 h-4" />
            Mon profil
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-8">

          {/* Formations */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#0F291E] mb-6">Mes Cursus Actifs</h2>
            {mesFormations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm mb-4">Vous n'avez pas encore de formation en cours.</p>
                <Link href="/formations" className="px-5 py-2.5 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition">
                  Parcourir le catalogue
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {mesFormations.map((formation) => (
                  <div key={formation.id} className="p-4 border border-gray-100 rounded-2xl hover:border-emerald-200 transition bg-gray-50 hover:bg-white flex justify-between items-center group">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formation.category}</span>
                      <h3 className="font-bold text-[#0F291E] group-hover:text-emerald-700 transition">{formation.title}</h3>
                    </div>
                    <Link href={`/dashboard/cours/${formation.id}`} className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold rounded-full hover:bg-emerald-50 hover:text-emerald-800 transition shadow-sm">
                      Reprendre
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Masterclasses achetées */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#0F291E] mb-6">Mes Masterclasses</h2>
            {mesMasterclasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm mb-4">Vous n'avez pas encore acheté de masterclass.</p>
                <Link href="/masterclass" className="px-5 py-2.5 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition">
                  Voir le catalogue
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {mesMasterclasses.map((mc) => {
                  const hasVideo = mc.options.includes('video') || mc.options.includes('pack');
                  const hasPdf   = mc.options.includes('pdf')   || mc.options.includes('pack');
                  return (
                    <div key={mc.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:border-emerald-100 transition">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[#0F291E] text-sm">{mc.title}</h3>
                        {mc.options.includes('pack') && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Package className="w-3 h-3" /> Pack Complet
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hasVideo && mc.video && (
                          <a
                            href={mc.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition"
                          >
                            <Video className="w-3.5 h-3.5" /> Vidéo
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        )}
                        {hasPdf && (
                          <Link
                            href={`/masterclass/${mc.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-lg transition"
                          >
                            <FileText className="w-3.5 h-3.5" /> Accéder au PDF
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Événements inscrits */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-[#0F291E]">Mes Événements</h2>
            </div>
            {mesEvenements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm mb-4">Vous n'êtes inscrit à aucun événement.</p>
                <Link href="/evenements" className="px-5 py-2.5 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition">
                  Voir les événements
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {mesEvenements.map((ev) => (
                  <div key={ev.id} className="p-4 border border-gray-100 rounded-2xl hover:border-emerald-200 transition bg-gray-50 hover:bg-white flex justify-between items-center gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${ev.status === 'paid' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {ev.status === 'paid' ? 'Payant' : 'Gratuit'}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#0F291E] text-sm truncate group-hover:text-emerald-700 transition">{ev.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ev.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        <span className="mx-1">·</span>
                        <MapPin className="w-3 h-3" />
                        {ev.location}
                      </p>
                    </div>
                    <Link href={`/evenements/${ev.id}`} className="shrink-0 px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold rounded-full hover:bg-emerald-50 hover:text-emerald-800 transition shadow-sm">
                      Voir
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique des paiements */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Receipt className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-[#0F291E]">Historique des paiements</h2>
            </div>
            {paymentHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">Aucun achat enregistré pour le moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Masterclass</th>
                      <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Option</th>
                      <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Montant</th>
                      <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paymentHistory.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 font-medium text-[#0F291E]">{p.masterclassTitle}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg capitalize">
                            {p.option}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-[#0F291E]">{p.amount.toFixed(2)} €</td>
                        <td className="py-3 text-gray-400">{p.purchasedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </section>
    </main>
  );
}