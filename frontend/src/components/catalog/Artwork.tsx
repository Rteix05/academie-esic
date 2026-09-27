import { ViewTransition, createElement } from 'react';
import {
  BookOpen, Briefcase, Code2, Heart, Megaphone, Monitor, Sparkles, Users, Video, Flame, Crown, type LucideIcon,
} from 'lucide-react';
import { artworkTransitionName, type CatalogItem } from '@/lib/catalog';

/**
 * Visuel d'un contenu : image téléversée, sinon illustration générée de façon stable
 * (même contenu = même illustration, sur la carte comme sur la page détail).
 * Enveloppé dans un <ViewTransition> nommé pour le morphing catalogue → détail.
 */

// Déclinaisons de la palette de l'Académie
const PALETTES = [
  { bg: 'bg-brand-forest',  blobA: 'bg-brand-emerald/35', blobB: 'bg-white/5',       ring: 'border-white/10',        tile: 'bg-white/10 text-emerald-200' },
  { bg: 'bg-brand-emerald', blobA: 'bg-brand-forest/25',  blobB: 'bg-white/15',      ring: 'border-white/20',        tile: 'bg-white/20 text-white' },
  { bg: 'bg-[#123B2C]',     blobA: 'bg-amber-400/25',     blobB: 'bg-brand-emerald/25', ring: 'border-amber-300/20', tile: 'bg-white/10 text-amber-200' },
  { bg: 'bg-brand-sage',    blobA: 'bg-brand-emerald/25', blobB: 'bg-white/60',      ring: 'border-brand-forest/10', tile: 'bg-white text-brand-forest' },
] as const;

const CATEGORY_ICONS: [RegExp, LucideIcon][] = [
  [/biblique|bible|théolog/i, BookOpen],
  [/famille|vie chrétienne/i, Heart],
  [/leadership|ministère/i, Crown],
  [/discipulat|engagement/i, Flame],
  [/personnel/i, Sparkles],
  [/management|gestion/i, Briefcase],
  [/web|développement|code/i, Code2],
  [/bureautique|informatique/i, Monitor],
  [/marketing|communication/i, Megaphone],
  [/communauté|groupe/i, Users],
];

function hash(value: number): number {
  // Petit mélange d'entiers : répartition stable et variée des palettes
  let h = value * 2654435761;
  h ^= h >>> 16;
  return Math.abs(h);
}

/** Icône illustrant la catégorie (élément déjà rendu : pas de composant créé pendant le rendu) */
function iconFor(item: Pick<CatalogItem, 'kind' | 'category'>, className: string) {
  const match = CATEGORY_ICONS.find(([re]) => item.category && re.test(item.category));
  const icon: LucideIcon = match ? match[1] : item.kind === 'masterclass' ? Video : BookOpen;
  return createElement(icon, { className });
}

export default function Artwork({
  item,
  shared = false,
  size = 'card',
  className = '',
  fill = false,
}: {
  item: Pick<CatalogItem, 'kind' | 'id' | 'image' | 'category' | 'title'>;
  /** Participe au morphing catalogue → détail (un seul élément par nom et par page) */
  shared?: boolean;
  size?: 'card' | 'feature' | 'hero';
  className?: string;
  /** Remplit son parent positionné (bandeau, hero) au lieu de suivre le flux */
  fill?: boolean;
}) {
  const h = hash(item.id + (item.kind === 'masterclass' ? 7 : 0));
  const p = PALETTES[h % PALETTES.length];
  const tileSize = size === 'hero' ? 'h-40 w-40 rounded-[2.5rem]' : size === 'feature' ? 'h-20 w-20 rounded-3xl' : 'h-14 w-14 rounded-2xl';
  const iconSize = size === 'hero' ? 'h-16 w-16' : size === 'feature' ? 'h-9 w-9' : 'h-6 w-6';
  // Position des formes décoratives variant selon le contenu
  const shift = (h >> 3) % 3;

  const art = (
    <div className={`${fill ? 'absolute inset-0' : 'relative'} overflow-hidden ${item.image ? 'bg-brand-forest' : p.bg} ${className}`}>
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- images servies par le backend (domaine variable)
        <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        size === 'hero' ? (
          // Grand format : illustration sur la moitié droite (la gauche porte le texte du hero)
          <>
            <div aria-hidden="true" className={`absolute right-[-6%] top-1/2 h-[130%] w-[60%] -translate-y-1/2 rounded-full ${p.blobA}`} />
            <div aria-hidden="true" className={`absolute right-[14%] top-[12%] h-[44%] w-[26%] rounded-full ${p.blobB}`} />
            <div aria-hidden="true" className={`absolute bottom-[10%] right-[32%] h-40 w-40 rounded-full border-[18px] ${p.ring}`} />
            <span aria-hidden="true" className={`absolute right-[16%] top-1/2 hidden -translate-y-1/2 items-center justify-center md:flex ${tileSize} ${p.tile}`}>
              {iconFor(item, iconSize)}
            </span>
          </>
        ) : (
          <>
            <div aria-hidden="true" className={`absolute rounded-full ${p.blobA} ${['-right-10 -top-12 h-48 w-48', '-left-12 -bottom-16 h-56 w-56', 'right-6 -bottom-20 h-52 w-52'][shift]}`} />
            <div aria-hidden="true" className={`absolute rounded-full ${p.blobB} ${['-left-8 bottom-4 h-28 w-28', 'right-8 -top-10 h-32 w-32', '-left-10 -top-10 h-36 w-36'][shift]}`} />
            <div aria-hidden="true" className={`absolute rounded-full border-[12px] ${p.ring} ${['left-1/3 top-1/4 h-20 w-20', 'right-1/4 bottom-1/4 h-16 w-16', 'left-1/4 bottom-6 h-14 w-14'][shift]}`} />
            <span aria-hidden="true" className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center ${tileSize} ${p.tile}`}>
              {iconFor(item, iconSize)}
            </span>
          </>
        )
      )}
    </div>
  );

  return shared ? (
    <ViewTransition name={artworkTransitionName(item)} share="morph" default="none">
      {art}
    </ViewTransition>
  ) : art;
}
