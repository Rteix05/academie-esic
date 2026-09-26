import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-[#FBFBFA] flex flex-col items-center justify-center px-6 text-center gap-8">
      <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center">
        <AlertTriangle className="w-9 h-9 text-emerald-700" />
      </div>

      <div>
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Erreur 404</p>
        <h1 className="text-4xl md:text-5xl font-black text-[#0F291E] tracking-tight mb-4">
          Page introuvable
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-[#0F291E] text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition shadow-md"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/formations"
          className="px-6 py-3 bg-white border border-gray-200 text-[#0F291E] text-sm font-bold uppercase tracking-wider rounded-full hover:bg-gray-50 transition"
        >
          Voir les formations
        </Link>
      </div>
    </main>
  );
}
