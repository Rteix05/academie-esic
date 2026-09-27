/**
 * Modèle commun aux catalogues formations / masterclass (cartes, carrousels, pages détail).
 * Fonctions pures : utilisables côté serveur comme côté client.
 */
import { uploadUrl } from './api';

export type ContentKind = 'formation' | 'masterclass';

export interface CatalogItem {
  kind: ContentKind;
  id: number;
  href: string;
  title: string;
  /** Formateur ou intervenant */
  author?: string | null;
  category?: string | null;
  image?: string | null;
  /** Texte brut (HTML retiré) pour les résumés */
  summary: string;
  priceLabel: string;
  /** Informations courtes affichées sous le titre (durée, niveau, formats…) */
  meta: string[];
  badge?: string | null;
  available: boolean;
}

/* ─── Données brutes de l'API (champs utilisés uniquement) ─────────────────── */

export interface FormationDto {
  id: number;
  title: string;
  description?: string | null;
  price?: number | null;
  duration?: string | null;
  level?: string | null;
  category?: string | null;
  institut?: string | null;
  trainer?: string | null;
  imagePreview?: string | null;
  objectives?: string | null;
  modalities?: string | null;
  published?: boolean;
  pdfAvailable?: boolean;
}

export interface MasterclassDto {
  id: number;
  title: string;
  description?: string | null;
  speakerName?: string | null;
  expert?: string | null;
  category?: string | null;
  scheduledAt?: string | null;
  pricePdf?: number | null;
  priceVideo?: number | null;
  pricePack?: number | null;
  imagePreview?: string | null;
  live?: boolean;
  isLive?: boolean;
  videoAvailable?: boolean;
  pdfAvailable?: boolean;
}

/** Extrait la liste d'une réponse API Platform (JSON-LD ou JSON) */
export function collection<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const d = data as Record<string, unknown> | null;
  return ((d?.['member'] ?? d?.['hydra:member'] ?? []) as T[]);
}

export function stripHtml(html?: string | null): string {
  return (html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

const euros = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(2)} €`;

/** Tarif le plus bas parmi les options d'une masterclass */
export function masterclassFromPrice(mc: MasterclassDto): number | null {
  const prices = [mc.pricePdf, mc.priceVideo, mc.pricePack].filter((p): p is number => typeof p === 'number' && p > 0);
  return prices.length ? Math.min(...prices) : null;
}

export function formationToItem(f: FormationDto): CatalogItem {
  return {
    kind: 'formation',
    id: f.id,
    href: `/formations/${f.id}`,
    title: f.title,
    author: f.trainer,
    category: f.category,
    image: f.imagePreview ? uploadUrl(f.imagePreview) : null,
    summary: stripHtml(f.description),
    priceLabel: f.price ? euros(f.price) : 'Gratuit',
    meta: [f.duration, f.level].filter((m): m is string => !!m),
    badge: f.price ? null : 'Gratuit',
    available: f.published !== false,
  };
}

export function masterclassToItem(mc: MasterclassDto): CatalogItem {
  const from = masterclassFromPrice(mc);
  return {
    kind: 'masterclass',
    id: mc.id,
    href: `/masterclass/${mc.id}`,
    title: mc.title,
    author: mc.expert || mc.speakerName,
    category: mc.category || 'Masterclass',
    image: mc.imagePreview ? uploadUrl(mc.imagePreview) : null,
    summary: stripHtml(mc.description),
    priceLabel: from ? `Dès ${euros(from)}` : 'Bientôt disponible',
    meta: [mc.videoAvailable ? 'Vidéo' : null, mc.pdfAvailable ? 'Livret PDF' : null].filter((m): m is string => !!m),
    badge: null,
    available: from !== null,
  };
}

/* ─── Rangées (façon plateforme de streaming) ─────────────────────────────── */

export interface CatalogRow {
  key: string;
  title: string;
  subtitle?: string;
  items: CatalogItem[];
}

/**
 * Regroupe les éléments par catégorie, dans l'ordre préféré puis alphabétique.
 * Les rangées vides sont écartées.
 */
export function rowsByCategory(items: CatalogItem[], preferredOrder: string[] = []): CatalogRow[] {
  const groups = new Map<string, CatalogItem[]>();
  for (const item of items) {
    const key = item.category?.trim() || 'Autres programmes';
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const rank = (k: string) => {
    const i = preferredOrder.findIndex((p) => p.toLowerCase() === k.toLowerCase());
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, 'fr'))
    .map(([title, rowItems]) => ({ key: `cat-${title}`, title, items: rowItems }));
}

/** Contenus « similaires » : même catégorie d'abord, puis le reste, sans l'élément courant */
export function similarItems(current: CatalogItem, all: CatalogItem[]): { same: CatalogItem[]; others: CatalogItem[] } {
  const pool = all.filter((i) => i.id !== current.id && i.available);
  const sameCat = (i: CatalogItem) => !!current.category && i.category?.toLowerCase() === current.category.toLowerCase();
  return {
    same: pool.filter(sameCat),
    others: pool.filter((i) => !sameCat(i)),
  };
}

/** Élément mis en avant en tête de catalogue : de préférence avec visuel */
export function pickFeatured(items: CatalogItem[]): CatalogItem | null {
  const available = items.filter((i) => i.available);
  return available.find((i) => i.image) ?? available[0] ?? null;
}

/** Nom de transition partagé entre la carte du catalogue et le hero de la page détail */
export const artworkTransitionName = (item: Pick<CatalogItem, 'kind' | 'id'>) => `${item.kind}-art-${item.id}`;
export const titleTransitionName   = (item: Pick<CatalogItem, 'kind' | 'id'>) => `${item.kind}-title-${item.id}`;
