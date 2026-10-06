import { apiFetch } from '@/lib/api';

/**
 * Abonnements mensuels par institut : chaque formule donne accès à toutes les formations
 * publiées de son institut tant que l'abonnement est actif.
 */

/** Offre affichée (prix lu dans Stripe par le backend) */
export interface SubscriptionOffer {
  plan: string;
  institut: string;
  label: string;
  amount: number;
  currency: string;
  interval: string;
}

/** Abonnement de l'élève connecté */
export interface MySubscription {
  id: number;
  plan: string;
  institut: string;
  label: string;
  status: string;
  active: boolean;
  currentPeriodEnd: string | null; // ISO 8601
  cancelAt: string | null;
  endedAt: string | null;
}

export async function fetchSubscriptionOffers(): Promise<SubscriptionOffer[]> {
  try {
    const res = await apiFetch('/api/subscription-plans');
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Abonnements de l'élève (liste vide si non connecté) */
export async function fetchMySubscriptions(): Promise<MySubscription[]> {
  try {
    const res = await apiFetch('/api/mes-abonnements');
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

/** Ancre de la carte d'abonnement d'une formule sur /formations */
export function offerAnchor(plan: string): string {
  return `abonnement-${plan}`;
}
