'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, GraduationCap } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Formation {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
}

export default function SalleDeCoursPage() {
  const router = useRouter();
  const params = useParams(); // Permet de récupérer l'ID dans l'URL
  const formationId = params.id;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Accès réservé aux élèves qui possèdent la formation (session via cookie httpOnly)
    apiFetch('/api/mes-formations')
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return Promise.reject(null); }
        const owned: { id: number }[] = res.ok ? await res.json() : [];
        if (!owned.some((f) => f.id === Number(formationId))) {
          throw new Error("Vous n'avez pas accès à ce cours.");
        }

        // 2. On récupère les détails de CETTE formation précise
        const detail = await apiFetch(`/api/formations/${formationId}`, {
          headers: { Accept: 'application/ld+json, application/json' },
        });
        if (!detail.ok) throw new Error("Impossible de charger le contenu de ce cours.");
        return detail.json();
      })
      .then((data) => {
        setFormation(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!err) return; // redirection vers /login déjà lancée
        setError(err.message);
        setIsLoading(false);
      });
  }, [formationId, router]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center text-[#0F291E] font-medium">Chargement de votre salle de cours...</div>;
  }

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-6">
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl mb-6">{error || "Cours introuvable"}</div>
        <Link href="/dashboard" className="px-6 py-3 bg-[#0F291E] text-white rounded-full text-sm font-bold">Retour au Dashboard</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased">
      
      {/* Navbar minimaliste pour rester concentré */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-[#0F291E] transition flex items-center gap-2">
            ← Retour au tableau de bord
          </Link>
        </div>
        <div className="text-xs font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full">
          {formation.category}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* En-tête du cours */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#0F291E] mb-3">{formation.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Durée : {formation.duration}</span>
            <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> Niveau : {formation.level}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Lecteur Vidéo (Simulé) et Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video bg-gray-900 rounded-2xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-emerald-500 transition cursor-pointer">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1"></div>
              </div>
              <p className="text-white/50 text-xs mt-4 font-medium tracking-widest uppercase">Lecteur vidéo en cours de développement</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-[#0F291E] mb-4">À propos de ce module</h2>
              <p className="text-gray-600 leading-relaxed font-light whitespace-pre-wrap">
                {formation.description}
              </p>
            </div>
          </div>

          {/* Sidebar - Plan du cours */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-[#0F291E] mb-6 border-b border-gray-100 pb-4">Plan du cursus</h3>
            
            <div className="space-y-3">
              {/* Leçons simulées (Dans le futur, elles viendront de la BDD) */}
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl cursor-pointer">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">Chapitre 1</p>
                <p className="text-sm font-semibold text-[#0F291E]">Introduction et fondamentaux</p>
              </div>
              
              <div className="p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-xl transition cursor-pointer">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Chapitre 2</p>
                <p className="text-sm font-medium text-gray-700">Mise en pratique</p>
              </div>

              <div className="p-3 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-xl transition cursor-pointer">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Chapitre 3</p>
                <p className="text-sm font-medium text-gray-700">Validation des acquis</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button className="w-full py-3 bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider rounded-full cursor-not-allowed">
                Obtenir mon certificat
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-2">Disponible à la fin du cursus</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}