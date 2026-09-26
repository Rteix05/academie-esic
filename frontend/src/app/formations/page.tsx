'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, AlertCircle, RefreshCw, User } from 'lucide-react';

interface Formation {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  category: string;
  institut?: string | null;
  trainer?: string | null;
  isPublished?: boolean;
  imagePreview?: string | null;
}

const IBT_SUBCATEGORIES = [
  'Toutes',
  'Formation biblique',
  'Discipulat',
  'Développement personnel',
  'Famille et vie chrétienne',
  'Autres programmes',
];

const EML_SUBCATEGORIES = [
  'Toutes',
  'Leadership chrétien',
  'Formation poussée',
  'Ministère',
];

const INSTITUTES = [
  {
    key: 'Institut Biblique Théologique',
    label: 'Institut Biblique Théologique',
    subtitle: 'Institut 1',
    color: '',
    badgeColor: '',
    subcategories: IBT_SUBCATEGORIES,
  },
  {
    key: 'École du Ministère et du Leadership',
    label: 'École du Ministère et du Leadership',
    subtitle: 'Institut 2',
    color: '',
    badgeColor: '',
    subcategories: EML_SUBCATEGORIES,
  },
];

function FormationCard({ f }: { f: Formation }) {
  return (
    <Link href={`/formations/${f.id}`} className="group flex flex-col bg-white border border-[#E5E7EB] overflow-hidden hover:shadow-lg hover:shadow-[#0F291E]/8 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative h-44 bg-[#0F291E] overflow-hidden flex-shrink-0">
        {f.imagePreview ? (
          <img
            src={`http://localhost:8000/uploads/images/${f.imagePreview}`}
            alt={f.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#059669]/40" />
          </div>
        )}
        {f.category && (
          <span className="absolute top-3 left-3 bg-[#059669] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
            {f.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="font-display text-lg font-bold text-[#0F291E] mb-2 group-hover:text-[#059669] transition-colors line-clamp-2 leading-snug">
          {f.title}
        </h3>
        {f.trainer && (
          <p className="text-xs text-[#059669] font-medium mb-3 flex items-center gap-1.5">
            <User className="w-3 h-3" /> {f.trainer}
          </p>
        )}
        <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed mb-5 flex-1">
          {(f.description || '').replace(/<[^>]*>/g, '').trim() || 'Aucune description disponible.'}
        </p>
        <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4 mt-auto">
          <span className="font-display text-base font-bold text-[#0F291E]">
            {!f.price ? 'Gratuit' : `${f.price} €`}
          </span>
          {f.duration && (
            <span className="flex items-center gap-1 text-[10px] text-[#4B5563] uppercase tracking-wider">
              <Clock className="w-3 h-3" /> {f.duration}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeSubcat, setActiveSubcat] = useState<Record<string, string>>({
    'Institut Biblique Théologique': 'Toutes',
    'École du Ministère et du Leadership': 'Toutes',
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:8000/api/formations', {
        headers: { Accept: 'application/ld+json, application/json' },
      });
      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
      const data = await res.json();
      const list: Formation[] = data['hydra:member'] || data['member'] || (Array.isArray(data) ? data : []);
      setFormations(list);
    } catch (err: any) {
      setError(err.message || 'Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getFormationsFor = (institutKey: string, subcat: string) =>
    formations.filter((f) => {
      const matchInstitut = f.institut === institutKey || (!f.institut && institutKey === 'Institut Biblique Théologique');
      const matchSubcat   = subcat === 'Toutes' || f.category === subcat;
      return matchInstitut && matchSubcat;
    });

  return (
    <main className="min-h-screen text-[#0F291E] font-sans antialiased overflow-x-hidden">

      {/* HERO */}
      <section className="bg-[#0F291E] text-[#F0FDF4] py-24 px-8 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-5">Catalogue Officiel</p>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">Nos Formations</h1>
          <p className="text-[#A7F3D0]/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Deux instituts, des dizaines de parcours structurés pour édifier des disciples solides et former des leaders du Royaume de Dieu.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#059669]/20"></div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-20 space-y-24">

        {/* Chargement */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="max-w-md mx-auto py-20 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button onClick={load} className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F291E] text-[#FBFBFA] text-xs font-bold uppercase tracking-wider hover:bg-[#059669] hover:text-[#0F291E] transition">
              <RefreshCw className="w-3.5 h-3.5" /> Réessayer
            </button>
          </div>
        )}

        {/* Blocs par institut */}
        {!loading && !error && INSTITUTES.map((inst) => {
          const filtered   = getFormationsFor(inst.key, activeSubcat[inst.key]);
          const allForInst = getFormationsFor(inst.key, 'Toutes');
          if (allForInst.length === 0) return null;

          return (
            <div key={inst.key}>
              {/* En-tête */}
              <div className="border-b border-[#E5E7EB] pb-8 mb-8">
                <p className="text-[#059669] text-xs font-bold uppercase tracking-[0.22em] mb-2">{inst.subtitle}</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0F291E]">{inst.label}</h2>
              </div>

              {/* Filtres sous-catégories */}
              <div className="flex flex-wrap gap-2 mb-10">
                {inst.subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubcat((s) => ({ ...s, [inst.key]: sub }))}
                    className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition border ${
                      activeSubcat[inst.key] === sub
                        ? 'bg-[#0F291E] text-[#FBFBFA] border-[#0F291E]'
                        : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#059669] hover:text-[#059669]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Grille de cartes */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-[#4B5563] text-sm border border-[#E5E7EB]">
                  Aucune formation dans cette sous-catégorie pour le moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((f) => <FormationCard key={f.id} f={f} />)}
                </div>
              )}
            </div>
          );
        })}

        {/* Vide global */}
        {!loading && !error && formations.length === 0 && (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
            <p className="text-[#4B5563] text-sm">Aucune formation disponible pour le moment.</p>
          </div>
        )}
      </section>
    </main>
  );
}
