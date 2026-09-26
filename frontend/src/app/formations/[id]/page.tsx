'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, GraduationCap, Award, CheckCircle, User, Target, FileText, Settings } from 'lucide-react';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import { apiFetch } from '@/lib/api';

interface Formation {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  category: string;
  institut?: string | null;
  objectives?: string | null;
  trainer?: string | null;
  modalities?: string | null;
}

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isOwned, setIsOwned] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchFormation = apiFetch(`/api/formations/${id}`, {
      headers: { 'Accept': 'application/ld+json' }
    }).then(r => r.ok ? r.json() : Promise.reject('Formation introuvable.'));

    // Non connecté : 401 → liste vide
    const fetchOwned = apiFetch('/api/mes-formations')
      .then(r => r.ok ? r.json() : []).catch(() => []);

    Promise.all([fetchFormation, fetchOwned])
      .then(([data, owned]) => {
        setFormation(data);
        const ownedList: Formation[] = Array.isArray(owned) ? owned : (owned['hydra:member'] || []);
        setIsOwned(ownedList.some((f) => f.id === Number(id)));
        setIsLoading(false);
      })
      .catch((err) => {
        setError(typeof err === 'string' ? err : 'Erreur lors du chargement.');
        setIsLoading(false);
      });
  }, [id]);

  const handleCheckout = async () => {
    setIsEnrolling(true);
    try {
      // Formation gratuite : inscription directe. Payante : session de paiement Stripe.
      const isFree = !formation?.price || formation.price <= 0;
      const res = await apiFetch(
        isFree ? `/api/formations/${id}/enroll` : `/api/stripe/checkout/formation/${id}`,
        { method: 'POST' }
      );
      if (res.status === 401) { router.push('/login'); return; }

      let data: { url?: string; message?: string };
      try { data = await res.json(); } catch { throw new Error('Réponse invalide du serveur.'); }

      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'inscription.');

      if (isFree) {
        setIsOwned(true);
        return;
      }
      if (!data.url) throw new Error('URL de paiement manquante.');

      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Impossible de finaliser l'inscription.");
    } finally {
      setIsEnrolling(false);
    }
  };

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center text-[#4B5563] font-medium">
        Chargement de la formation…
      </div>
    );
  }

  // Erreur / introuvable
  if (error || !formation) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-6 text-center gap-6">
        <h1 className="font-display text-4xl font-bold text-[#0F291E]">Formation introuvable</h1>
        <p className="text-[#4B5563]">{error}</p>
        <Link href="/formations" className="px-6 py-3 bg-[#0F291E] text-[#FBFBFA] text-sm font-bold uppercase tracking-wider hover:bg-[#059669] hover:text-[#0F291E] transition">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#0F291E] font-sans antialiased pb-24">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>

      {/* Fil d'Ariane */}
      <nav className="bg-[#F0FDF4] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-2 text-xs text-[#4B5563]">
          <Link href="/formations" className="hover:text-[#059669] transition">Formations</Link>
          <span className="text-[#E5E7EB]">/</span>
          {formation.institut && <><span className="text-[#E5E7EB] truncate max-w-[180px]">{formation.institut}</span><span className="text-[#E5E7EB]">/</span></>}
          <span className="text-[#0F291E] font-medium truncate max-w-[220px]">{formation.title}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 mt-12 flex flex-col lg:flex-row gap-14 items-start">

        {/* ── Colonne principale ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-12">

          {/* En-tête */}
          <div className="border-b border-[#E5E7EB] pb-10">
            <div className="flex flex-wrap gap-2 mb-5">
              {formation.institut && (
                <span className="text-xs font-semibold text-[#059669] bg-[#F0FDF4] border border-[#E5E7EB] px-3 py-1">
                  {formation.institut}
                </span>
              )}
              {formation.category && (
                <span className="text-xs font-semibold text-[#4B5563] bg-white border border-[#E5E7EB] px-3 py-1">
                  {formation.category}
                </span>
              )}
              {formation.level && (
                <span className="text-xs font-semibold text-[#0F291E] bg-white border border-[#E5E7EB] px-3 py-1">
                  Niveau : {formation.level}
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0F291E] leading-tight mb-5">
              {formation.title}
            </h1>
            {formation.trainer && (
              <p className="flex items-center gap-2 text-sm text-[#4B5563]">
                <User className="w-4 h-4 text-[#059669]" />
                Formateur : <strong className="text-[#0F291E] font-semibold">{formation.trainer}</strong>
              </p>
            )}
          </div>

          {/* Objectifs */}
          {formation.objectives && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-[#0F291E]">
                <Target className="w-5 h-5 text-[#059669]" /> Objectifs
              </h2>
              <div className="prose prose-sm max-w-none text-[#4B5563] [&_li]:text-[#4B5563] [&_li::marker]:text-[#059669]"
                dangerouslySetInnerHTML={{ __html: formation.objectives }} />
            </div>
          )}

          {/* Contenu */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-[#0F291E]">
              <FileText className="w-5 h-5 text-[#059669]" /> Contenu de la formation
            </h2>
            <div className="prose prose-sm max-w-none text-[#4B5563] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formation.description }} />
          </div>

          {/* Modalités */}
          {formation.modalities && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-[#0F291E]">
                <Settings className="w-5 h-5 text-[#059669]" /> Modalités
              </h2>
              <div className="prose prose-sm max-w-none text-[#4B5563]"
                dangerouslySetInnerHTML={{ __html: formation.modalities }} />
            </div>
          )}
        </div>

        {/* ── Sidebar d'inscription ──────────────────────────────────────── */}
        <div className="w-full lg:w-96 bg-white border border-[#E5E7EB] p-8 sticky top-8 flex flex-col gap-7 shrink-0">

          {/* Instructor */}
          {formation.trainer && (
            <div className="flex items-center gap-4 pb-7 border-b border-[#F3F4F6]">
              <div className="w-12 h-12 bg-[#0F291E] flex items-center justify-center text-[#F0FDF4] text-sm font-bold shrink-0">
                {formation.trainer.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F291E]">{formation.trainer}</p>
                <p className="text-xs text-[#059669] font-medium uppercase tracking-wider">Formateur</p>
              </div>
            </div>
          )}

          {isOwned ? (
            <>
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-14 h-14 bg-[#F0FDF4] border border-[#E5E7EB] flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-[#059669]" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#0F291E]">Formation débloquée</h2>
                <p className="text-sm text-[#4B5563]">Vous avez accès à cette formation. Retrouvez le contenu dans votre espace.</p>
              </div>
              <Link href="/dashboard" className="w-full py-4 text-center text-[#FBFBFA] text-sm font-bold uppercase tracking-wider bg-[#0F291E] hover:bg-[#059669] hover:text-[#0F291E] transition">
                Accéder à mon espace
              </Link>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-[#4B5563] font-medium uppercase tracking-wider mb-1">Frais de formation</p>
                <p className="font-display text-5xl font-bold text-[#0F291E]">{formation.price ? `${formation.price} €` : 'Gratuit'}</p>
              </div>

              <ul className="space-y-3 border-t border-[#F3F4F6] pt-6">
                {formation.duration && (
                  <li className="flex items-center text-sm text-[#4B5563] gap-3">
                    <Clock className="w-4 h-4 text-[#059669] shrink-0" /> Durée : <strong className="text-[#0F291E]">{formation.duration}</strong>
                  </li>
                )}
                <li className="flex items-center text-sm text-[#4B5563] gap-3">
                  <GraduationCap className="w-4 h-4 text-[#059669] shrink-0" /> Accès à vie au contenu
                </li>
                <li className="flex items-center text-sm text-[#4B5563] gap-3">
                  <Award className="w-4 h-4 text-[#059669] shrink-0" /> Certificat de réussite inclus
                </li>
              </ul>

              <button
                className={`w-full py-4 text-sm font-bold uppercase tracking-wider transition ${
                  isEnrolling ? 'bg-[#E5E7EB] text-[#4B5563] cursor-not-allowed' : 'bg-[#0F291E] text-[#FBFBFA] hover:bg-[#059669] hover:text-[#0F291E]'
                }`}
                onClick={handleCheckout}
                disabled={isEnrolling}
              >
                {isEnrolling ? 'Redirection vers le paiement…' : "S'inscrire à cette formation"}
              </button>

              <p className="text-xs text-center text-[#4B5563]">
                Paiement 100 % sécurisé · Remboursé sous 14 jours
              </p>
            </>
          )}
        </div>

      </div>
    </main>
  );
}
