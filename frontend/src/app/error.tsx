'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center px-6 text-center gap-8 font-sans">
        <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center">
          <AlertTriangle className="w-9 h-9 text-red-500" />
        </div>

        <div>
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Erreur inattendue</p>
          <h1 className="text-4xl font-black text-[#0F291E] tracking-tight mb-4">
            Une erreur est survenue
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Nous nous excusons pour la gêne. Vous pouvez réessayer ou revenir à l'accueil.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#0F291E] text-white text-sm font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition shadow-md"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white border border-gray-200 text-[#0F291E] text-sm font-bold uppercase tracking-wider rounded-full hover:bg-gray-50 transition"
          >
            Retour à l'accueil
          </Link>
        </div>
    </div>
  );
}
