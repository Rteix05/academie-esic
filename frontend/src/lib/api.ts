/**
 * Client HTTP de l'API Symfony.
 *
 * L'authentification repose sur un cookie httpOnly (BEARER) posé par le backend au login :
 * le JWT n'est jamais accessible au JavaScript, donc hors de portée d'une faille XSS.
 * Chaque requête doit simplement envoyer les cookies (credentials: 'include').
 */

export const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '');

/**
 * URL du backend pour les requêtes faites CÔTÉ SERVEUR (composants serveur Next).
 * Dans Docker, « localhost » désigne le conteneur frontend lui-même : il faut passer par
 * le nom du service (docker-compose définit BACKEND_INTERNAL_URL=http://backend:8000).
 * Hors Docker (npm run dev sur la machine), l'URL publique suffit.
 */
export const SERVER_API_URL = (process.env.BACKEND_INTERNAL_URL ?? API_URL).replace(/\/$/, '');

/** URL publique d'une image téléversée dans le back-office */
export function uploadUrl(fileName: string): string {
  return `${API_URL}/uploads/images/${fileName}`;
}

/** Événement navigateur émis quand l'état de connexion change (login, logout, session expirée) */
export const AUTH_EVENT = 'esic:auth-changed';

export function notifyAuthChanged(authenticated: boolean): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { authenticated } }));
  }
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' });

  // Session absente ou expirée : on prévient l'interface (Navbar, pages protégées)
  if (res.status === 401) notifyAuthChanged(false);

  return res;
}

/** Profil de l'utilisateur connecté, ou null si non connecté */
export interface Me {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles: string[];
}

export async function fetchMe(): Promise<Me | null> {
  try {
    const res = await apiFetch('/api/me');
    return res.ok ? ((await res.json()) as Me) : null;
  } catch {
    return null;
  }
}

/** Le cookie étant httpOnly, seul le serveur peut l'effacer */
export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/logout', { method: 'POST' });
  } finally {
    notifyAuthChanged(false);
  }
}
