/**
 * Consentement au chargement des lecteurs vidéo tiers (YouTube, Google Drive, Vimeo).
 *
 * Ces services peuvent déposer leurs propres cookies : leur lecteur n'est chargé qu'après
 * un clic de l'utilisateur (qui vaut consentement pour cette vidéo). S'il le demande, le choix
 * est mémorisé dans son navigateur pour ce service pendant 6 mois (recommandation CNIL),
 * et peut être retiré à tout moment depuis la politique de confidentialité.
 */

const STORAGE_KEY = 'esic-video-consent';
const VALIDITY_MS = 183 * 24 * 60 * 60 * 1000; // ≈ 6 mois

type Stored = Record<string, number>; // service → date du consentement (ms)

function read(): Stored {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return value && typeof value === 'object' ? (value as Stored) : {};
  } catch {
    return {};
  }
}

/** Le visiteur a-t-il mémorisé son accord pour ce service (et est-il encore valable) ? */
export function hasVideoConsent(provider: string): boolean {
  if (typeof window === 'undefined') return false;
  const at = read()[provider];
  return typeof at === 'number' && Date.now() - at < VALIDITY_MS;
}

export function rememberVideoConsent(provider: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), [provider]: Date.now() }));
  } catch {
    // Stockage indisponible (navigation privée…) : l'accord vaut pour cette lecture uniquement
  }
}

/** Retrait de tous les accords mémorisés */
export function forgetVideoConsents(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Rien à faire
  }
}

/** Services mémorisés et encore valables */
export function storedVideoConsents(): string[] {
  if (typeof window === 'undefined') return [];
  return Object.entries(read())
    .filter(([, at]) => typeof at === 'number' && Date.now() - at < VALIDITY_MS)
    .map(([provider]) => provider);
}

/** Politique de confidentialité de chaque service (information avant consentement) */
export const PROVIDER_PRIVACY_URL: Record<string, string> = {
  YouTube: 'https://policies.google.com/privacy',
  'Google Drive': 'https://policies.google.com/privacy',
  Vimeo: 'https://vimeo.com/privacy',
};
