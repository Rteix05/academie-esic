import Link from 'next/link';
import { BookOpen } from 'lucide-react';

/**
 * Logo de l'Académie : pastille + nom + sous-titre (style de la maquette de référence).
 * `inverted` : version claire pour les fonds sombres (pied de page).
 */
export default function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Académie E.S.I.C. — Accueil"
      className="group flex items-center gap-3 rounded-2xl focus-visible:outline-offset-4"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 ${
          inverted ? 'bg-brand-emerald text-white' : 'bg-brand-forest text-white dark:bg-brand-emerald'
        }`}
        aria-hidden="true"
      >
        <BookOpen className="h-5 w-5" />
      </span>
      <span className="flex flex-col whitespace-nowrap leading-tight">
        <span className={`font-display text-base font-semibold ${inverted ? 'text-white' : 'text-brand-forest dark:text-emerald-50'}`}>
          Académie E.S.I.C.
        </span>
        <span className={`text-[11px] font-medium ${inverted ? 'text-emerald-200/70' : 'text-brand-muted dark:text-gray-400'}`}>
          Formation chrétienne
        </span>
      </span>
    </Link>
  );
}
