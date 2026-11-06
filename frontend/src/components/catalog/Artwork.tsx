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
  { bg: 'bg-brand-forest',  tile: 'bg-white/10 text-emerald-200' },
  { bg: 'bg-brand-emerald', tile: 'bg-white/15 text-white' },
  { bg: 'bg-[#123B2C]',     tile: 'bg-white/10 text-amber-200' },
  { bg: 'bg-brand-sage',    tile: 'bg-white text-brand-forest' },
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
  const tileSize = size === 'hero' ? 'h-32 w-32 rounded-3xl' : size === 'feature' ? 'h-20 w-20 rounded-2xl' : 'h-14 w-14 rounded-xl';
  const iconSize = size === 'hero' ? 'h-16 w-16' : size === 'feature' ? 'h-9 w-9' : 'h-6 w-6';

  const art = (
    <div className={`${fill ? 'absolute inset-0' : 'relative'} overflow-hidden ${item.image ? 'bg-brand-forest' : p.bg} ${className}`}>
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- images servies par le backend (domaine variable)
        <img
          src={item.image}
          alt=""
          // Grand visuel en haut de page : chargé en priorité ; vignettes : à l'approche de l'écran
          loading={size === 'hero' ? 'eager' : 'lazy'}
          fetchPriority={size === 'hero' ? 'high' : 'auto'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // Pas de photo : fond uni aux couleurs de la marque et icône de la catégorie (aucun décor)
        <span
          aria-hidden="true"
          className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center ${size === 'hero' ? 'right-[16%] hidden md:flex' : 'left-1/2 -translate-x-1/2'} ${tileSize} ${p.tile}`}
        >
          {iconFor(item, iconSize)}
        </span>
      )}
    </div>
  );

  return shared ? (
    <ViewTransition name={artworkTransitionName(item)} share="morph" default="none">
      {art}
    </ViewTransition>
  ) : art;
}
