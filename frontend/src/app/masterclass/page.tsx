'use client';

import { useEffect, useState, Suspense } from 'react';
import MasterclassesList from '@/components/MasterclassesList';
import PaymentSuccessPopup from '@/components/PaymentSuccessPopup';
import { apiFetch } from '@/lib/api';
import { Sparkles, ShieldCheck, Clock, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

interface Masterclass {
  id: number;
  title: string;
  description: string;
  speakerName: string;
  price: number;
  [key: string]: any; 
}

export default function MasterclassPage() {
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Catalogue public, format JSON-LD d'API Platform
      const res = await apiFetch('/api/masterclasses', {
        headers: { 'Accept': 'application/ld+json, application/json' },
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      const list = data['hydra:member'] || data['member'] || (Array.isArray(data) ? data : []);
      setMasterclasses(list);
      setError(null);
    } catch (err: any) {
      console.error("Impossible de charger les masterclasses", err);
      setError(err.message || "Une erreur réseau est survenue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased overflow-x-hidden">
      <Suspense fallback={null}>
        <PaymentSuccessPopup />
      </Suspense>
      
      {/* 1. HERO SECTION (Identité spirituelle, chaleureuse et parfaitement centrée) */}
      <section className="bg-[#0F291E] text-white py-28 px-6 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">
        {/* Halo lumineux subtil en arrière-plan */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-widest rounded-full mb-6 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Enseignements Exclusifs
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-[1.15]">
            Les Masterclass
          </h1>
          
          <p className="text-emerald-100/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Des sessions intensives et profondes animées par des enseignants engagés. Allez plus loin dans l'étude de la Parole et découvrez des clés pratiques pour fortifier votre marche chrétienne.
          </p>
        </div>
      </section>

      {/* 2. SECTION REASSURANCE / ACHAT (Pour rassurer avant l'achat des cours) */}
      <section className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F291E]">Paiement 100% Sécurisé</h3>
              <p className="text-xs text-gray-400 mt-0.5">Vos transactions sont protégées via Stripe.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-t pt-4 md:pt-0 md:border-t-0 md:border-l border-gray-100 md:pl-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F291E]">Accès Illimité & À Vie</h3>
              <p className="text-xs text-gray-400 mt-0.5">Apprenez et méditez à votre propre rythme.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t pt-4 md:pt-0 md:border-t-0 md:border-l border-gray-100 md:pl-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F291E]">Supports d'Édification</h3>
              <p className="text-xs text-gray-400 mt-0.5">Vidéos HD et livrets d'étude inclus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LISTE DES MASTERCLASS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-medium gap-3">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm animate-pulse">Chargement des enseignements...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 font-medium bg-red-50/50 rounded-3xl border border-red-100 max-w-md mx-auto px-6 flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div>
              <p className="font-bold text-gray-800 mb-1">Impossible de charger le catalogue</p>
              <p className="text-xs text-red-400">{error}</p>
            </div>
            <button 
              onClick={loadData} 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700 transition shadow-md shadow-red-600/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Réessayer l'authentification
            </button>
          </div>
        ) : masterclasses.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm">Aucune masterclass n'est disponible pour le moment. Repassez très bientôt.</p>
          </div>
        ) : (
          <MasterclassesList masterclasses={masterclasses} />
        )}
      </section>
    </main>
  );
}