/**
 * Client HTTP de l'API Symfony.
 *
 * L'authentification repose sur un cookie httpOnly (BEARER) posé par le backend au login :
 * le JWT n'est jamais accessible au JavaScript, donc hors de portée d'une faille XSS.
 * Chaque requête doit simplement envoyer les cookies (credentials: 'include').
 */

export const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '');

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
