import { SERVER_API_URL } from '@/lib/api';

/** Actualité publiée depuis l'admin */
export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  publishedAt: string; // ISO 8601
}

/**
 * Actualités visibles (rendu serveur, mises en cache 5 minutes).
 * Liste vide si l'API est injoignable : la section est alors masquée.
 */
export async function fetchNews(limit?: number): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/actualites${limit ? `?limit=${limit}` : ''}`, { next: { revalidate: 300 } });
    const data = res.ok ? await res.json() : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Heure de Paris : le serveur Node tourne en UTC, une parution à minuit s'afficherait sinon la veille */
export function formatNewsDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
}
