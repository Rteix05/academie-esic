import { apiFetch } from '@/lib/api';

/**
 * Accès complets aux instituts : achat unique donnant accès à vie à toutes les formations
 * publiées de l'institut, y compris celles publiées après l'achat.
 */

/** Offre affichée (prix lu dans Stripe par le backend) */
export interface InstitutPackOffer {
  pack: string;
  institut: string;
  label: string;
  amount: number;
  currency: string;
}

/** Accès institut acheté par l'élève connecté */
export interface MyInstitutPack {
  id: number;
  pack: string;
  institut: string;
  label: string;
  purchasedAt: string; // ISO 8601
}

export async function fetchInstitutPackOffers(): Promise<InstitutPackOffer[]> {
  try {
    const res = await apiFetch('/api/institut-packs');
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Accès instituts de l'élève (liste vide si non connecté) */
export async function fetchMyInstitutPacks(): Promise<MyInstitutPack[]> {
  try {
    const res = await apiFetch('/api/mes-instituts');
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Ancre de la carte d'accès complet d'un institut sur /formations */
export function offerAnchor(pack: string): string {
  return `acces-${pack}`;
}
