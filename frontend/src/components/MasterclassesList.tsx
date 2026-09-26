'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Check, Calendar, User, ArrowRight, Video, FileText, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import ProtectedVideoPlayer from './ProtectedVideoPlayer';
import { apiFetch } from '@/lib/api';

interface Purchase {
  id: number;
  options: string[];
  /** Lien vidéo — renvoyé par l'API uniquement pour l'option vidéo/pack */
  video?: string | null;
}

interface MasterclassesListProps {
  masterclasses: any[];
}

export default function MasterclassesList({ masterclasses }: MasterclassesListProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  
  // 🟢 États pour gérer la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    // Non connecté : 401 → aucun achat
    apiFetch('/api/mes-masterclasses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Purchase[]) => setPurchases(data))
      .catch(() => {});
  }, []);

  const getOptions = (id: number) => purchases.find((p) => p.id === id)?.options ?? [];

  // 🟢 Logique de découpage (Pagination)
  const totalPages = Math.ceil(masterclasses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = masterclasses.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Liste des Masterclasses de la page courante (5 max) */}
      {currentItems.map((mc: any) => {
        const estAchetee = getOptions(Number(mc.id)).length > 0;
        const videoSrc = purchases.find((p) => p.id === Number(mc.id))?.video ?? null;

        return (
          <div 
            key={mc.id} 
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:border-emerald-100/60 transition-all duration-300 flex flex-col md:flex-row p-4 gap-6 items-center animate-in fade-in-50 duration-200"
          >
            {/* 1. ZONE MÉDIA / APERÇU VIDÉO */}
            <div className="w-full md:w-72 h-44 bg-[#0F291E] rounded-2xl relative flex items-center justify-center overflow-hidden flex-shrink-0">
              {mc.videoAvailable ? (
                estAchetee && videoSrc ? (
                  <ProtectedVideoPlayer
                    src={videoSrc}
                    mcId={Number(mc.id)}
                  />
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <img
                      src={mc.imagePreview
                        ? `http://localhost:8000/uploads/images/${mc.imagePreview}`
                        : 'https://images.unsplash.com/photo-1610116306796-6ebd30d779c6?q=80&w=600&auto=format&fit=crop'
                      }
                      className="w-full h-full object-cover blur-[3px] scale-105 opacity-30 group-hover:scale-105 transition-all duration-500"
                      alt="Aperçu spirituel"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F291E]/90 to-transparent flex flex-col items-center justify-center p-4">
                      <div className="w-9 h-9 bg-amber-500/10 border border-amber-400/30 rounded-full flex items-center justify-center mb-2 shadow-lg">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <span className="text-white font-bold text-[10px] uppercase tracking-widest">Enseignement réservé</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0F291E] to-[#1a3f30] flex items-center justify-center overflow-hidden">
                  {mc.imagePreview ? (
                    <img
                      src={`http://localhost:8000/uploads/images/${mc.imagePreview}`}
                      className="w-full h-full object-cover"
                      alt={mc.title}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4">
                      <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-400/20 rounded-xl flex items-center justify-center">
                        <Video className="w-5 h-5 text-emerald-400/60" />
                      </div>
                      <span className="text-[10px] font-medium text-emerald-300/40 tracking-wider uppercase text-center">{mc.category || 'Masterclass'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. INFOS ET MÉTADONNÉES */}
            <div className="flex-grow flex flex-col w-full py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border border-amber-100">
                  {mc.category || 'Théologie Pratique'}
                </span>
                {mc.isLive && (
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border border-rose-100 animate-pulse">
                    En Direct
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-[#0F291E] mb-1 group-hover:text-emerald-800 transition-colors">
                {mc.title}
              </h2>
              
              <div className="flex items-center gap-4 text-gray-400 text-xs font-medium mb-4">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-600">Par {mc.expert || mc.speakerName || "Intervenant ESIC"}</span>
                </div>
                {mc.scheduledAt && (
                  <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-500">Planifié</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 max-w-xl line-clamp-2 mb-4 leading-relaxed">
                {(mc.description || '').replace(/<[^>]*>/g, '').trim() || "Aucune description fournie pour cet enseignement spirituel."}
              </p>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-3 max-w-md">
                <div className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-gray-500 font-medium">Cours Vidéo HD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] text-gray-500 font-medium">Livret d'étude (PDF)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[11px] text-gray-500 font-medium">Accès Mobile & PC</span>
                </div>
              </div>
            </div>

            {/* 3. PRIX ET BOUTONS ACTION */}
            <div className="w-full md:w-48 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 self-stretch flex-shrink-0">
              <div className="mb-4 text-center md:text-right">
                {!estAchetee ? (
                  <>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Tarif unique</span>
                    <span className="text-2xl font-black text-[#0F291E]">
                      {mc.price === 0 || !mc.price ? 'Gratuit' : `${mc.price} €`}
                    </span>
                  </>
                ) : (
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md block">
                    Acquis &bull; À vie
                  </span>
                )}
              </div>

              <div className="w-full mt-auto">
                {estAchetee ? (
                  <div className="w-full text-center py-2.5 bg-emerald-600/10 border border-emerald-600/20 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 bg-emerald-600 text-white rounded-full p-0.5" /> Prêt pour l'étude
                  </div>
                ) : (
                  <Link
                    href={`/masterclass/${mc.id}`}
                    className="flex items-center gap-2 px-4 py-3 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 w-full justify-center text-center group/btn"
                  >
                    Rejoindre
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

          </div>
        );
      })}

      {/* 🟢 BARRE DE PAGINATION HAUT DE GAMME (S'affiche uniquement si plus de 5 éléments) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-4 px-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 hover:text-[#0F291E] transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Page <span className="text-[#0F291E]">{currentPage}</span> sur {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 bg-white rounded-xl hover:bg-gray-50 hover:text-[#0F291E] transition disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}